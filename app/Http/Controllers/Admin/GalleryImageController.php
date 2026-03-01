<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreGalleryImageRequest;
use App\Http\Requests\Admin\UpdateGalleryImageRequest;
use App\Models\Gallery;
use App\Models\GalleryImage;
use App\Services\ImageUploadService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class GalleryImageController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->query('search', '');
        $galleryIdQuery = $request->query('gallery_id');
        $status = (string) $request->query('status', '');

        $galleryId = is_numeric($galleryIdQuery) ? (int) $galleryIdQuery : null;

        if (!in_array($status, ['active', 'inactive'], true)) {
            $status = '';
        }

        $images = GalleryImage::query()
            ->with(['gallery:id,title', 'uploader:id,name'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($innerQuery) use ($search): void {
                    $innerQuery
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('caption', 'like', "%{$search}%")
                        ->orWhere('alt_text', 'like', "%{$search}%");
                });
            })
            ->when($galleryId !== null, function ($query) use ($galleryId): void {
                $query->where('gallery_id', $galleryId);
            })
            ->when($status !== '', function ($query) use ($status): void {
                $query->where('is_active', $status === 'active');
            })
            ->orderBy('sort_order')
            ->latest('id')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (GalleryImage $image): array => [
                'id' => $image->id,
                'gallery_id' => $image->gallery_id,
                'title' => $image->title,
                'caption' => $image->caption,
                'alt_text' => $image->alt_text,
                'image_url' => $image->image_url,
                'is_watermarked' => $image->is_watermarked,
                'sort_order' => $image->sort_order,
                'is_active' => $image->is_active,
                'gallery' => [
                    'id' => $image->gallery?->id,
                    'title' => $image->gallery?->title ?? '-',
                ],
                'uploader' => [
                    'id' => $image->uploader?->id,
                    'name' => $image->uploader?->name ?? '-',
                ],
                'created_at' => $image->created_at?->format('Y-m-d H:i'),
            ]);

        $galleryOptions = Gallery::query()
            ->orderBy('title')
            ->get(['id', 'title'])
            ->map(fn (Gallery $gallery): array => [
                'id' => $gallery->id,
                'title' => $gallery->title,
            ])
            ->values()
            ->all();

        return Inertia::render('GalleryImages/Index', [
            'images' => $images,
            'galleries' => $galleryOptions,
            'filters' => [
                'search' => $search,
                'gallery_id' => $galleryId,
                'status' => $status,
            ],
            'stats' => [
                'total' => GalleryImage::count(),
                'active' => GalleryImage::where('is_active', true)->count(),
                'inactive' => GalleryImage::where('is_active', false)->count(),
                'watermarked' => GalleryImage::where('is_watermarked', true)->count(),
            ],
        ]);
    }

    public function store(
        StoreGalleryImageRequest $request,
        ImageUploadService $imageService
    ): RedirectResponse {
        $validated = $request->validated();

        $validated['image_path'] = $imageService->storeOptimized(
            $request->file('image'),
            'gallery-images',
            (bool) ($validated['use_watermark'] ?? false),
        );
        $validated['user_id'] = $request->user()->id;
        $validated['is_watermarked'] = (bool) ($validated['use_watermark'] ?? false);

        unset($validated['image'], $validated['use_watermark']);
        GalleryImage::create($validated);

        return back()->with('success', 'Gambar gallery berhasil ditambahkan.');
    }

    public function update(
        UpdateGalleryImageRequest $request,
        GalleryImage $galleryImage,
        ImageUploadService $imageService
    ): RedirectResponse {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            if ($galleryImage->image_path && Storage::disk('public')->exists($galleryImage->image_path)) {
                Storage::disk('public')->delete($galleryImage->image_path);
            }

            $validated['image_path'] = $imageService->storeOptimized(
                $request->file('image'),
                'gallery-images',
                (bool) ($validated['use_watermark'] ?? false),
            );
            $validated['is_watermarked'] = (bool) ($validated['use_watermark'] ?? false);
        }

        if ($galleryImage->user_id === null) {
            $validated['user_id'] = $request->user()->id;
        }

        unset($validated['image'], $validated['use_watermark']);
        $galleryImage->update($validated);

        return back()->with('success', 'Gambar gallery berhasil diperbarui.');
    }

    public function destroy(GalleryImage $galleryImage): RedirectResponse
    {
        if ($galleryImage->image_path && Storage::disk('public')->exists($galleryImage->image_path)) {
            Storage::disk('public')->delete($galleryImage->image_path);
        }

        $galleryImage->delete();

        return back()->with('success', 'Gambar gallery berhasil dihapus.');
    }
}
