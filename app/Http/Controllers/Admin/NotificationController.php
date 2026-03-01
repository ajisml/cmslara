<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreNotificationRequest;
use App\Http\Requests\Admin\UpdateNotificationRequest;
use App\Models\CmsNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeSuperadmin($request);

        $search = (string) $request->query('search', '');
        $targetRole = (string) $request->query('target_role', '');
        $type = (string) $request->query('type', '');
        $status = (string) $request->query('status', '');

        if (!in_array($targetRole, ['all', 'superadmin', 'admin', 'editor', 'author', 'viewer'], true)) {
            $targetRole = '';
        }

        if (!in_array($type, ['info', 'success', 'warning', 'danger'], true)) {
            $type = '';
        }

        if (!in_array($status, ['active', 'inactive'], true)) {
            $status = '';
        }

        $notifications = CmsNotification::query()
            ->with('creator:id,name')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($innerQuery) use ($search): void {
                    $innerQuery
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('message', 'like', "%{$search}%")
                        ->orWhere('link_url', 'like', "%{$search}%");
                });
            })
            ->when($targetRole !== '', function ($query) use ($targetRole): void {
                $query->where('target_role', $targetRole);
            })
            ->when($type !== '', function ($query) use ($type): void {
                $query->where('type', $type);
            })
            ->when($status !== '', function ($query) use ($status): void {
                $query->where('is_active', $status === 'active');
            })
            ->orderByDesc('published_at')
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (CmsNotification $notification): array => [
                'id' => $notification->id,
                'title' => $notification->title,
                'message' => $notification->message,
                'type' => $notification->type,
                'target_role' => $notification->target_role,
                'link_url' => $notification->link_url,
                'is_active' => $notification->is_active,
                'published_at' => $notification->published_at?->format('Y-m-d H:i'),
                'creator' => [
                    'id' => $notification->creator?->id,
                    'name' => $notification->creator?->name ?? '-',
                ],
                'created_at' => $notification->created_at?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'filters' => [
                'search' => $search,
                'target_role' => $targetRole,
                'type' => $type,
                'status' => $status,
            ],
            'stats' => [
                'total' => CmsNotification::count(),
                'active' => CmsNotification::where('is_active', true)->count(),
                'inactive' => CmsNotification::where('is_active', false)->count(),
                'superadmin_targeted' => CmsNotification::where('target_role', 'superadmin')->count(),
            ],
        ]);
    }

    public function store(StoreNotificationRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['created_by'] = $request->user()->id;

        CmsNotification::create($validated);

        return back()->with('success', 'Notifikasi berhasil ditambahkan.');
    }

    public function update(
        UpdateNotificationRequest $request,
        CmsNotification $notification
    ): RedirectResponse {
        $validated = $request->validated();
        $notification->update($validated);

        return back()->with('success', 'Notifikasi berhasil diperbarui.');
    }

    public function destroy(Request $request, CmsNotification $notification): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        $notification->delete();

        return back()->with('success', 'Notifikasi berhasil dihapus.');
    }

    private function authorizeSuperadmin(Request $request): void
    {
        abort_if($request->user()?->role !== 'superadmin', 403);
    }
}
