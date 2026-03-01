<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreHashtagRequest;
use App\Http\Requests\Admin\UpdateHashtagRequest;
use App\Models\Hashtag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HashtagController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->query('search', '');

        $hashtags = Hashtag::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($innerQuery) use ($search): void {
                    $innerQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->latest('views_count')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Hashtag $hashtag): array => [
                'id' => $hashtag->id,
                'name' => $hashtag->name,
                'slug' => $hashtag->slug,
                'description' => $hashtag->description,
                'views_count' => $hashtag->views_count,
                'is_active' => $hashtag->is_active,
                'created_at' => $hashtag->created_at?->format('Y-m-d H:i'),
            ]);

        $topHashtags = Hashtag::query()
            ->orderByDesc('views_count')
            ->limit(5)
            ->get(['id', 'name', 'slug', 'views_count'])
            ->map(fn (Hashtag $hashtag): array => [
                'id' => $hashtag->id,
                'name' => $hashtag->name,
                'slug' => $hashtag->slug,
                'views_count' => $hashtag->views_count,
            ])
            ->values()
            ->all();

        return Inertia::render('Hashtags/Index', [
            'hashtags' => $hashtags,
            'filters' => [
                'search' => $search,
            ],
            'topHashtags' => $topHashtags,
            'stats' => [
                'total' => Hashtag::count(),
                'active' => Hashtag::where('is_active', true)->count(),
                'inactive' => Hashtag::where('is_active', false)->count(),
                'views' => (int) Hashtag::sum('views_count'),
            ],
        ]);
    }

    public function store(StoreHashtagRequest $request): RedirectResponse
    {
        Hashtag::create($request->validated());

        return back()->with('success', 'Hastag berhasil ditambahkan.');
    }

    public function update(UpdateHashtagRequest $request, Hashtag $hashtag): RedirectResponse
    {
        $hashtag->update($request->validated());

        return back()->with('success', 'Hastag berhasil diperbarui.');
    }

    public function destroy(Hashtag $hashtag): RedirectResponse
    {
        $hashtag->delete();

        return back()->with('success', 'Hastag berhasil dihapus.');
    }
}
