<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePermissionRequest;
use App\Http\Requests\Admin\StoreRoleRequest;
use App\Http\Requests\Admin\SyncRolePermissionsRequest;
use App\Http\Requests\Admin\UpdatePermissionRequest;
use App\Http\Requests\Admin\UpdateRoleRequest;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RolePermissionController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['role_search', 'permission_search', 'permission_group', 'selected_role_id']);

        $roles = Role::query()
            ->withCount(['users', 'permissions'])
            ->when($filters['role_search'] ?? null, function ($query, $search): void {
                $query->where(function ($innerQuery) use ($search): void {
                    $innerQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate(10, ['*'], 'roles_page')
            ->withQueryString();

        $permissions = Permission::query()
            ->withCount('roles')
            ->when($filters['permission_search'] ?? null, function ($query, $search): void {
                $query->where(function ($innerQuery) use ($search): void {
                    $innerQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when(
                $filters['permission_group'] ?? null,
                fn ($query, $group) => $query->where('group_name', $group)
            )
            ->orderBy('group_name')
            ->orderBy('name')
            ->paginate(10, ['*'], 'permissions_page')
            ->withQueryString();

        $permissionGroups = Permission::query()
            ->orderBy('group_name')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'group_name'])
            ->groupBy('group_name')
            ->map(fn ($items, $group) => [
                'group' => $group,
                'permissions' => $items->map(fn (Permission $permission) => [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'slug' => $permission->slug,
                ])->values(),
            ])
            ->values();

        $selectedRoleId = (int) ($filters['selected_role_id'] ?? 0);
        $selectedRole = Role::query()
            ->with('permissions:id')
            ->when($selectedRoleId > 0, fn ($query) => $query->whereKey($selectedRoleId))
            ->first();

        if (!$selectedRole) {
            $selectedRole = Role::query()->with('permissions:id')->orderBy('name')->first();
        }

        return Inertia::render('RolePermissions/Index', [
            'roles' => $roles->through(fn (Role $role): array => [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug,
                'description' => $role->description,
                'is_active' => $role->is_active,
                'users_count' => $role->users_count,
                'permissions_count' => $role->permissions_count,
                'created_at' => $role->created_at?->format('Y-m-d H:i'),
            ]),
            'permissions' => $permissions->through(fn (Permission $permission): array => [
                'id' => $permission->id,
                'name' => $permission->name,
                'slug' => $permission->slug,
                'group_name' => $permission->group_name,
                'description' => $permission->description,
                'roles_count' => $permission->roles_count,
                'created_at' => $permission->created_at?->format('Y-m-d H:i'),
            ]),
            'permissionGroups' => $permissionGroups,
            'selectedRole' => $selectedRole ? [
                'id' => $selectedRole->id,
                'name' => $selectedRole->name,
                'permission_ids' => $selectedRole->permissions->pluck('id')->values()->all(),
            ] : null,
            'roleOptions' => Role::query()
                ->orderBy('name')
                ->get(['id', 'name', 'slug'])
                ->map(fn (Role $role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                ])
                ->values()
                ->all(),
            'permissionGroupOptions' => Permission::query()
                ->select('group_name')
                ->distinct()
                ->orderBy('group_name')
                ->pluck('group_name')
                ->values()
                ->all(),
            'filters' => [
                'role_search' => $filters['role_search'] ?? '',
                'permission_search' => $filters['permission_search'] ?? '',
                'permission_group' => $filters['permission_group'] ?? '',
                'selected_role_id' => $selectedRole?->id,
            ],
            'stats' => [
                'roles' => Role::count(),
                'permissions' => Permission::count(),
                'mapped' => DB::table('permission_role')->count(),
                'users_with_known_role' => User::query()
                    ->whereIn('role', Role::query()->pluck('slug'))
                    ->count(),
            ],
        ]);
    }

    public function storeRole(StoreRoleRequest $request): RedirectResponse
    {
        Role::create($request->validated());

        return back()->with('success', 'Role berhasil ditambahkan.');
    }

    public function updateRole(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $validated = $request->validated();
        $oldSlug = $role->slug;

        DB::transaction(function () use ($role, $validated, $oldSlug): void {
            $role->update($validated);

            if ($oldSlug !== $role->slug) {
                User::query()
                    ->where('role', $oldSlug)
                    ->update(['role' => $role->slug]);
            }
        });

        return back()->with('success', 'Role berhasil diperbarui.');
    }

    public function destroyRole(Role $role): RedirectResponse
    {
        if ($role->slug === 'superadmin') {
            return back()->with('error', 'Role superadmin tidak dapat dihapus.');
        }

        if ($role->users()->exists()) {
            return back()->with('error', 'Role masih dipakai user, tidak bisa dihapus.');
        }

        $role->delete();

        return back()->with('success', 'Role berhasil dihapus.');
    }

    public function syncRolePermissions(
        SyncRolePermissionsRequest $request,
        Role $role
    ): RedirectResponse {
        $role->permissions()->sync($request->validated('permission_ids', []));

        return back()->with('success', "Permission untuk role {$role->name} berhasil diperbarui.");
    }

    public function storePermission(StorePermissionRequest $request): RedirectResponse
    {
        Permission::create($request->validated());

        return back()->with('success', 'Permission berhasil ditambahkan.');
    }

    public function updatePermission(
        UpdatePermissionRequest $request,
        Permission $permission
    ): RedirectResponse {
        $permission->update($request->validated());

        return back()->with('success', 'Permission berhasil diperbarui.');
    }

    public function destroyPermission(Permission $permission): RedirectResponse
    {
        $permission->delete();

        return back()->with('success', 'Permission berhasil dihapus.');
    }
}
