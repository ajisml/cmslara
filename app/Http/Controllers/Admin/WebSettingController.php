<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateWebSettingRequest;
use App\Models\WebSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class WebSettingController extends Controller
{
    public function edit(): Response
    {
        $setting = WebSetting::query()->firstOrCreate([]);

        return Inertia::render('Settings/Web', [
            'setting' => $this->presentSetting($setting),
        ]);
    }

    public function update(UpdateWebSettingRequest $request): RedirectResponse
    {
        $setting = WebSetting::query()->firstOrCreate([]);

        $validated = $request->validated();

        $fileMap = [
            'logo' => 'logo_path',
            'icon' => 'icon_path',
            'favicon' => 'favicon_path',
            'meta_thumbnail' => 'meta_thumbnail_path',
        ];

        foreach ($fileMap as $inputName => $columnName) {
            if ($request->hasFile($inputName)) {
                if (filled($setting->{$columnName}) && Storage::disk('public')->exists($setting->{$columnName})) {
                    Storage::disk('public')->delete($setting->{$columnName});
                }

                $validated[$columnName] = $request->file($inputName)->store('web-settings', 'public');
            }

            unset($validated[$inputName]);
        }

        foreach ($validated as $key => $value) {
            if (is_string($value) && blank(trim($value))) {
                $validated[$key] = null;
            }
        }

        $setting->fill($validated)->save();

        return back()->with('success', 'Web settings berhasil diperbarui.');
    }

    private function presentSetting(WebSetting $setting): array
    {
        return [
            'site_title' => $setting->site_title,
            'slogan' => $setting->slogan,
            'short_description' => $setting->short_description,
            'meta_description' => $setting->meta_description,
            'meta_keywords' => $setting->meta_keywords,
            'meta_thumbnail_url' => $setting->meta_thumbnail_url,
            'logo_url' => $setting->logo_url,
            'icon_url' => $setting->icon_url,
            'favicon_url' => $setting->favicon_url,
            'contact_email' => $setting->contact_email,
            'contact_phone' => $setting->contact_phone,
            'whatsapp_number' => $setting->whatsapp_number,
            'address' => $setting->address,
            'city' => $setting->city,
            'province' => $setting->province,
            'country' => $setting->country,
            'postal_code' => $setting->postal_code,
            'google_maps_url' => $setting->google_maps_url,
            'facebook_url' => $setting->facebook_url,
            'instagram_url' => $setting->instagram_url,
            'youtube_url' => $setting->youtube_url,
            'tiktok_url' => $setting->tiktok_url,
            'x_url' => $setting->x_url,
            'linkedin_url' => $setting->linkedin_url,
            'threads_url' => $setting->threads_url,
        ];
    }
}
