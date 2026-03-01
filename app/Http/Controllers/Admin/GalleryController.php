<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreGalleryRequest;
use App\Http\Requests\Admin\UpdateGalleryRequest;
use App\Models\Gallery;
use App\Models\GalleryImage;
use App\Services\ImageUploadService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->query('search', '');
        $status = (string) $request->query('status', '');

        if (!in_array($status, ['active', 'inactive'], true)) {
            $status = '';
        }

        $galleries = Gallery::query()
            ->with('author:id,name')
            ->withCount('images')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($innerQuery) use ($search): void {
                    $innerQuery
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($status !== '', function ($query) use ($status): void {
                $query->where('is_active', $status === 'active');
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Gallery $gallery): array => [
                'id' => $gallery->id,
                'title' => $gallery->title,
                'slug' => $gallery->slug,
                'description' => $gallery->description,
                'cover_image_url' => $gallery->cover_image_url,
                'is_active' => $gallery->is_active,
                'images_count' => (int) $gallery->images_count,
                'author' => [
                    'id' => $gallery->author?->id,
                    'name' => $gallery->author?->name ?? '-',
                ],
                'created_at' => $gallery->created_at?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Galleries/Index', [
            'galleries' => $galleries,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'stats' => [
                'total' => Gallery::count(),
                'active' => Gallery::where('is_active', true)->count(),
                'inactive' => Gallery::where('is_active', false)->count(),
                'images' => GalleryImage::count(),
            ],
        ]);
    }

    public function store(StoreGalleryRequest $request, ImageUploadService $imageService): RedirectResponse
    {
        $validated = $request->validated();
        $validated['user_id'] = $request->user()->id;

        if ($request->hasFile('cover_image')) {
            $validated['cover_image_path'] = $imageService->storeOptimized(
                $request->file('cover_image'),
                'gallery-covers',
                (bool) ($validated['use_watermark'] ?? false),
            );
        }

        unset($validated['cover_image'], $validated['use_watermark']);
        Gallery::create($validated);

        return back()->with('success', 'Gallery berhasil ditambahkan.');
    }

    public function update(
        UpdateGalleryRequest $request,
        Gallery $gallery,
        ImageUploadService $imageService
    ): RedirectResponse {
        $validated = $request->validated();

        if ($request->hasFile('cover_image')) {
            if ($gallery->cover_image_path && Storage::disk('public')->exists($gallery->cover_image_path)) {
                Storage::disk('public')->delete($gallery->cover_image_path);
            }

            $validated['cover_image_path'] = $imageService->storeOptimized(
                $request->file('cover_image'),
                'gallery-covers',
                (bool) ($validated['use_watermark'] ?? false),
            );
        }

        if ($gallery->user_id === null) {
            $validated['user_id'] = $request->user()->id;
        }

        unset($validated['cover_image'], $validated['use_watermark']);
        $gallery->update($validated);

        return back()->with('success', 'Gallery berhasil diperbarui.');
    }

    public function destroy(Gallery $gallery): RedirectResponse
    {
        if ($gallery->cover_image_path && Storage::disk('public')->exists($gallery->cover_image_path)) {
            Storage::disk('public')->delete($gallery->cover_image_path);
        }

        $imagePaths = $gallery->images()->pluck('image_path')->filter()->values()->all();
        foreach ($imagePaths as $path) {
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        $gallery->delete();

        return back()->with('success', 'Gallery berhasil dihapus.');
    }
}
