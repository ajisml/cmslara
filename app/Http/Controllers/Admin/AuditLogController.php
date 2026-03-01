<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeSuperadmin($request);

        $search = (string) $request->query('search', '');
        $action = (string) $request->query('action', '');
        $role = (string) $request->query('role', '');
        $date = (string) $request->query('date', '');

        if (!in_array($action, ['create', 'update', 'delete', 'other'], true)) {
            $action = '';
        }

        $logs = AdminActivityLog::query()
            ->with('actor:id,name')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($innerQuery) use ($search): void {
                    $innerQuery
                        ->where('user_name', 'like', "%{$search}%")
                        ->orWhere('route_name', 'like', "%{$search}%")
                        ->orWhere('subject_label', 'like', "%{$search}%")
                        ->orWhere('ip_address', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($action !== '', fn ($query) => $query->where('action', $action))
            ->when($role !== '', fn ($query) => $query->where('role_slug', $role))
            ->when($date !== '', fn ($query) => $query->whereDate('created_at', $date))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (AdminActivityLog $log): array => [
                'id' => $log->id,
                'actor' => [
                    'id' => $log->actor?->id,
                    'name' => $log->actor?->name ?? $log->user_name ?? '-',
                    'role' => $log->role_slug ?? '-',
                ],
                'action' => $log->action,
                'method' => $log->method,
                'route_name' => $log->route_name,
                'subject_type' => $log->subject_type,
                'subject_id' => $log->subject_id,
                'subject_label' => $log->subject_label,
                'description' => $log->description,
                'ip_address' => $log->ip_address,
                'payload_keys' => $log->payload_keys ?? [],
                'created_at' => $log->created_at?->format('Y-m-d H:i:s'),
            ]);

        return Inertia::render('AuditLogs/Index', [
            'logs' => $logs,
            'filters' => [
                'search' => $search,
                'action' => $action,
                'role' => $role,
                'date' => $date,
            ],
            'roleOptions' => AdminActivityLog::query()
                ->select('role_slug')
                ->whereNotNull('role_slug')
                ->distinct()
                ->orderBy('role_slug')
                ->pluck('role_slug')
                ->values()
                ->all(),
            'stats' => [
                'total' => AdminActivityLog::count(),
                'today' => AdminActivityLog::whereDate('created_at', today())->count(),
                'updates' => AdminActivityLog::where('action', 'update')->count(),
                'deletes' => AdminActivityLog::where('action', 'delete')->count(),
            ],
        ]);
    }

    private function authorizeSuperadmin(Request $request): void
    {
        abort_if($request->user()?->role !== 'superadmin', 403);
    }
}
