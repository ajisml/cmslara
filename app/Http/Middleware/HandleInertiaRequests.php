<?php

namespace App\Http\Middleware;

use App\Models\CmsNotification;
use App\Models\WebSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'webSetting' => fn () => $this->sharedWebSetting(),
            'headerNotifications' => fn () => $this->sharedHeaderNotifications($request),
        ];
    }

    private function sharedWebSetting(): ?array
    {
        if (!Schema::hasTable('web_settings')) {
            return null;
        }

        $setting = WebSetting::query()->first();

        if (!$setting) {
            return null;
        }

        return [
            'site_title' => $setting->site_title,
            'slogan' => $setting->slogan,
            'short_description' => $setting->short_description,
            'logo_url' => $setting->logo_url,
            'icon_url' => $setting->icon_url,
            'favicon_url' => $setting->favicon_url,
            'contact_email' => $setting->contact_email,
            'contact_phone' => $setting->contact_phone,
            'whatsapp_number' => $setting->whatsapp_number,
            'address' => $setting->address,
            'facebook_url' => $setting->facebook_url,
            'instagram_url' => $setting->instagram_url,
            'youtube_url' => $setting->youtube_url,
            'tiktok_url' => $setting->tiktok_url,
            'x_url' => $setting->x_url,
            'linkedin_url' => $setting->linkedin_url,
            'threads_url' => $setting->threads_url,
        ];
    }

    private function sharedHeaderNotifications(Request $request): array
    {
        $user = $request->user();
        if (!$user || !Schema::hasTable('cms_notifications')) {
            return [
                'total' => 0,
                'items' => [],
            ];
        }

        $query = CmsNotification::query()
            ->where('is_active', true)
            ->where(function ($innerQuery) use ($user): void {
                $innerQuery
                    ->where('target_role', 'all')
                    ->orWhere('target_role', $user->role);
            })
            ->where(function ($innerQuery): void {
                $innerQuery
                    ->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            });

        $total = (clone $query)->count();
        $items = $query
            ->orderByDesc('published_at')
            ->latest('id')
            ->limit(3)
            ->get(['id', 'title', 'message', 'type', 'link_url', 'published_at', 'created_at'])
            ->map(fn (CmsNotification $notification): array => [
                'id' => $notification->id,
                'title' => $notification->title,
                'message' => $notification->message,
                'type' => $notification->type,
                'link_url' => $notification->link_url,
                'time' => ($notification->published_at ?? $notification->created_at)?->diffForHumans(),
            ])
            ->values()
            ->all();

        return [
            'total' => $total,
            'items' => $items,
        ];
    }
}
