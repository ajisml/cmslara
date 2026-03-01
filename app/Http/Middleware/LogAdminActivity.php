<?php

namespace App\Http\Middleware;

use App\Models\AdminActivityLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class LogAdminActivity
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (!$this->shouldLog($request, $response)) {
            return $response;
        }

        try {
            $this->persistLog($request);
        } catch (Throwable) {
            // Fail-safe: activity logging must never break main request flow.
        }

        return $response;
    }

    private function shouldLog(Request $request, Response $response): bool
    {
        if (!Schema::hasTable('admin_activity_logs')) {
            return false;
        }

        if (!in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            return false;
        }

        $user = $request->user();
        if (!$user) {
            return false;
        }

        $routeName = (string) ($request->route()?->getName() ?? '');
        if ($routeName === '' || Str::startsWith($routeName, 'profile.')) {
            return false;
        }

        if ($response->getStatusCode() >= 400) {
            return false;
        }

        if (
            $response->getStatusCode() === 302
            && $request->hasSession()
            && $request->session()->has('errors')
        ) {
            return false;
        }

        return true;
    }

    private function persistLog(Request $request): void
    {
        $user = $request->user();
        $routeName = (string) ($request->route()?->getName() ?? '');
        [$subjectType, $subjectId, $subjectLabel] = $this->extractSubject($request);
        $action = $this->resolveAction($request->method());

        $payloadKeys = collect($request->except([
            '_token',
            '_method',
            'password',
            'password_confirmation',
            'current_password',
        ]))
            ->keys()
            ->values()
            ->all();

        $description = sprintf(
            '%s %s',
            ucfirst($action),
            $subjectLabel ?: ($subjectType ?: $routeName)
        );

        AdminActivityLog::query()->create([
            'user_id' => $user?->id,
            'user_name' => $user?->name,
            'role_slug' => $user?->role,
            'action' => $action,
            'method' => $request->method(),
            'route_name' => $routeName,
            'url' => Str::limit($request->fullUrl(), 255, ''),
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'subject_label' => $subjectLabel,
            'description' => $description,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'payload_keys' => $payloadKeys,
        ]);
    }

    private function resolveAction(string $method): string
    {
        return match ($method) {
            'POST' => 'create',
            'DELETE' => 'delete',
            'PUT', 'PATCH' => 'update',
            default => 'other',
        };
    }

    private function extractSubject(Request $request): array
    {
        $parameters = $request->route()?->parameters() ?? [];

        foreach ($parameters as $parameter) {
            if (is_object($parameter) && method_exists($parameter, 'getKey')) {
                $type = class_basename($parameter);
                $id = (string) $parameter->getKey();

                $label = null;
                foreach (['title', 'name', 'slug', 'email'] as $key) {
                    if (isset($parameter->{$key}) && filled($parameter->{$key})) {
                        $label = (string) $parameter->{$key};
                        break;
                    }
                }

                return [
                    $type,
                    $id,
                    $label ? "{$type}#{$id} {$label}" : "{$type}#{$id}",
                ];
            }
        }

        return [null, null, null];
    }
}
