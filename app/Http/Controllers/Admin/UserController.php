<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'role', 'status']);
        $roleOptions = Schema::hasTable('roles')
            ? Role::query()
                ->orderBy('name')
                ->get(['name', 'slug'])
                ->map(fn (Role $role) => [
                    'label' => $role->name,
                    'value' => $role->slug,
                ])
                ->values()
                ->all()
            : collect(['superadmin', 'admin', 'editor', 'author', 'viewer'])
                ->map(fn (string $role) => [
                    'label' => ucfirst($role),
                    'value' => $role,
                ])
                ->all();

        $users = User::query()
            ->when($filters['search'] ?? null, function ($query, $search): void {
                $query->where(function ($innerQuery) use ($search): void {
                    $innerQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone_number', 'like', "%{$search}%");
                });
            })
            ->when($filters['role'] ?? null, fn ($query, $role) => $query->where('role', $role))
            ->when(
                isset($filters['status']) && $filters['status'] !== '',
                fn ($query) => $query->where('is_active', $filters['status'] === 'active')
            )
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'gender' => $user->gender,
                'profile_photo_url' => $user->profile_photo_url,
                'role' => $user->role,
                'is_active' => $user->is_active,
                'created_at' => $user->created_at?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'role' => $filters['role'] ?? '',
                'status' => $filters['status'] ?? '',
            ],
            'roles' => $roleOptions,
            'stats' => [
                'total' => User::count(),
                'active' => User::where('is_active', true)->count(),
                'inactive' => User::where('is_active', false)->count(),
                'admin' => User::whereIn('role', ['superadmin', 'admin'])->count(),
            ],
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        unset($validated['profile_photo']);

        if ($request->hasFile('profile_photo')) {
            $validated['profile_photo_path'] = $request->file('profile_photo')->store('profile-photos', 'public');
        }

        User::create($validated);

        return back()->with('success', 'User berhasil ditambahkan.');
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();
        unset($validated['profile_photo']);

        if (blank($validated['password'] ?? null)) {
            unset($validated['password']);
        }

        if ($request->hasFile('profile_photo')) {
            if ($user->profile_photo_path && Storage::disk('public')->exists($user->profile_photo_path)) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }

            $validated['profile_photo_path'] = $request->file('profile_photo')->store('profile-photos', 'public');
        }

        $user->update($validated);

        return back()->with('success', 'Data user berhasil diperbarui.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if (auth()->id() === $user->id) {
            return back()->with('error', 'Akun yang sedang login tidak bisa dihapus.');
        }

        if ($user->profile_photo_path && Storage::disk('public')->exists($user->profile_photo_path)) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }

        $user->delete();

        return back()->with('success', 'User berhasil dihapus.');
    }
}
