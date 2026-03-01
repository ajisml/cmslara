<?php

namespace App\Http\Middleware;

use App\Models\Role;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$requiredPermissions): Response
    {
        $user = $request->user();
        if (!$user) {
            abort(401);
        }

        if ($user->role === 'superadmin') {
            return $next($request);
        }

        if ($requiredPermissions === []) {
            return $next($request);
        }

        $requiredPermissions = collect($requiredPermissions)
            ->flatMap(fn (string $permission) => explode(',', $permission))
            ->map(fn (string $permission) => trim($permission))
            ->filter()
            ->values()
            ->all();

        if ($requiredPermissions === []) {
            return $next($request);
        }

        $permissionSlugs = $this->resolvePermissionSlugs($request, (string) $user->role);
        $missingPermissions = array_diff($requiredPermissions, $permissionSlugs);

        if ($missingPermissions !== []) {
            abort(403, 'Anda tidak memiliki permission untuk aksi ini.');
        }

        return $next($request);
    }

    private function resolvePermissionSlugs(Request $request, string $roleSlug): array
    {
        $cached = $request->attributes->get('resolved_permission_slugs');
        if (is_array($cached)) {
            return $cached;
        }

        $role = Role::query()
            ->where('slug', $roleSlug)
            ->where('is_active', true)
            ->first();

        if (!$role) {
            return [];
        }

        $slugs = $role->permissions()->pluck('slug')->values()->all();
        $request->attributes->set('resolved_permission_slugs', $slugs);

        return $slugs;
    }
}
