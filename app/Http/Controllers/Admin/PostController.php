<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePostRequest;
use App\Http\Requests\Admin\UpdatePostRequest;
use App\Models\Category;
use App\Models\ContentRevision;
use App\Models\Hashtag;
use App\Models\Post;
use App\Models\User;
use App\Support\ContentWorkflow;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->query('search', '');
        $authorIdQuery = $request->query('author_id');
        $categoryIdQuery = $request->query('category_id');
        $status = (string) $request->query('status', '');

        $authorId = is_numeric($authorIdQuery) ? (int) $authorIdQuery : null;
        $categoryId = is_numeric($categoryIdQuery) ? (int) $categoryIdQuery : null;

        if (!ContentWorkflow::isValidStatus($status)) {
            $status = '';
        }

        $posts = Post::query()
            ->with([
                'author:id,name',
                'category:id,name',
                'hashtags:id,name,slug',
            ])
            ->withCount('revisions')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($innerQuery) use ($search): void {
                    $innerQuery
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('excerpt', 'like', "%{$search}%")
                        ->orWhere('meta_description', 'like', "%{$search}%")
                        ->orWhere('meta_keywords', 'like', "%{$search}%");
                });
            })
            ->when($authorId !== null, function ($query) use ($authorId): void {
                $query->where('user_id', $authorId);
            })
            ->when($categoryId !== null, function ($query) use ($categoryId): void {
                $query->where('category_id', $categoryId);
            })
            ->when($status !== '', function ($query) use ($status): void {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Post $post): array => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'content' => $post->content,
                'thumbnail_url' => $post->thumbnail_url,
                'meta_description' => $post->meta_description,
                'meta_keywords' => $post->meta_keywords,
                'views_count' => $post->views_count,
                'status' => $post->status,
                'published_at' => $post->published_at?->format('Y-m-d H:i'),
                'submitted_for_review_at' => $post->submitted_for_review_at?->format('Y-m-d H:i'),
                'reviewed_at' => $post->reviewed_at?->format('Y-m-d H:i'),
                'approved_at' => $post->approved_at?->format('Y-m-d H:i'),
                'author' => [
                    'id' => $post->author?->id,
                    'name' => $post->author?->name ?? '-',
                ],
                'workflow_actions' => ContentWorkflow::allowedActions(
                    $request->user(),
                    $post->status,
                    $post->user_id,
                ),
                'category' => $post->category
                    ? [
                        'id' => $post->category->id,
                        'name' => $post->category->name,
                    ]
                    : null,
                'hashtags' => $post->hashtags->map(fn (Hashtag $hashtag): array => [
                    'id' => $hashtag->id,
                    'name' => $hashtag->name,
                    'slug' => $hashtag->slug,
                ])->values()->all(),
                'created_at' => $post->created_at?->format('Y-m-d H:i'),
                'revisions_count' => (int) $post->revisions_count,
            ]);

        $topPosts = Post::query()
            ->orderByDesc('views_count')
            ->limit(5)
            ->get(['id', 'title', 'slug', 'thumbnail_path', 'views_count', 'status'])
            ->map(fn (Post $post): array => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'thumbnail_url' => $post->thumbnail_url,
                'views_count' => $post->views_count,
                'status' => $post->status,
            ])
            ->values()
            ->all();

        return Inertia::render('Posts/Index', [
            'posts' => $posts,
            'filters' => [
                'search' => $search,
                'author_id' => $authorId,
                'category_id' => $categoryId,
                'status' => $status,
            ],
            'authors' => User::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (User $user): array => [
                    'id' => $user->id,
                    'name' => $user->name,
                ])
                ->values()
                ->all(),
            'categories' => Category::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Category $category): array => [
                    'id' => $category->id,
                    'name' => $category->name,
                ])
                ->values()
                ->all(),
            'hashtags' => Hashtag::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'slug'])
                ->map(fn (Hashtag $hashtag): array => [
                    'id' => $hashtag->id,
                    'name' => $hashtag->name,
                    'slug' => $hashtag->slug,
                ])
                ->values()
                ->all(),
            'topPosts' => $topPosts,
            'stats' => [
                'total' => Post::count(),
                'review' => Post::where('status', ContentWorkflow::STATUS_REVIEW)->count(),
                'approved' => Post::where('status', ContentWorkflow::STATUS_APPROVED)->count(),
                'published' => Post::where('status', 'published')->count(),
                'draft' => Post::where('status', 'draft')->count(),
                'views' => (int) Post::sum('views_count'),
            ],
        ]);
    }

    public function store(StorePostRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['user_id'] = $request->user()->id;
        $hashtagIds = $validated['hashtag_ids'] ?? [];

        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail_path'] = $request->file('thumbnail')->store('post-thumbnails', 'public');
        }

        $validated['status'] = ContentWorkflow::STATUS_DRAFT;
        $validated['submitted_for_review_at'] = null;
        $validated['reviewed_at'] = null;
        $validated['approved_at'] = null;
        $validated['reviewed_by'] = null;
        $validated['approved_by'] = null;
        $validated['published_at'] = null;

        unset($validated['thumbnail'], $validated['hashtag_ids']);

        $post = Post::create($validated);
        $post->hashtags()->sync($hashtagIds);
        $post->refresh();
        $this->createRevision($post, $request->user()->id, 'Versi awal');

        return back()->with('success', 'Postingan berhasil ditambahkan.');
    }

    public function update(UpdatePostRequest $request, Post $post): RedirectResponse
    {
        $validated = $request->validated();
        $hashtagIds = $validated['hashtag_ids'] ?? [];

        if ($request->hasFile('thumbnail')) {
            // Keep previous file so older revisions can still reference it.
            $validated['thumbnail_path'] = $request->file('thumbnail')->store('post-thumbnails', 'public');
        }

        if ($post->user_id === null) {
            $validated['user_id'] = $request->user()->id;
        }

        unset($validated['thumbnail'], $validated['hashtag_ids']);

        $post->update($validated);
        $post->hashtags()->sync($hashtagIds);
        $post->refresh();
        $this->createRevision($post, $request->user()->id, 'Konten diperbarui');

        return back()->with('success', 'Postingan berhasil diperbarui.');
    }

    public function submitReview(Request $request, Post $post): RedirectResponse
    {
        $user = $request->user();

        if (!ContentWorkflow::canSubmitForReview($user, $post->user_id)) {
            abort(403, 'Anda tidak berhak mengajukan konten ini ke review.');
        }

        if ($post->status !== ContentWorkflow::STATUS_DRAFT) {
            return back()->with('error', 'Hanya konten draft yang bisa diajukan ke review.');
        }

        $post->update([
            'status' => ContentWorkflow::STATUS_REVIEW,
            'submitted_for_review_at' => now(),
            'reviewed_at' => null,
            'approved_at' => null,
            'reviewed_by' => null,
            'approved_by' => null,
            'published_at' => null,
        ]);
        $post->refresh();
        $this->createRevision($post, $user->id, 'Diajukan ke review');

        return back()->with('success', 'Postingan berhasil diajukan untuk direview.');
    }

    public function approve(Request $request, Post $post): RedirectResponse
    {
        $user = $request->user();

        if (!ContentWorkflow::canApprove($user)) {
            abort(403, 'Role Anda tidak memiliki akses approval.');
        }

        if ($post->status !== ContentWorkflow::STATUS_REVIEW) {
            return back()->with('error', 'Hanya konten dengan status review yang bisa di-approve.');
        }

        $post->update([
            'status' => ContentWorkflow::STATUS_APPROVED,
            'reviewed_at' => now(),
            'reviewed_by' => $user->id,
            'approved_at' => now(),
            'approved_by' => $user->id,
            'published_at' => null,
        ]);
        $post->refresh();
        $this->createRevision($post, $user->id, 'Disetujui (approved)');

        return back()->with('success', 'Postingan berhasil di-approve.');
    }

    public function publish(Request $request, Post $post): RedirectResponse
    {
        $user = $request->user();

        if (!ContentWorkflow::canPublish($user)) {
            abort(403, 'Role Anda tidak memiliki akses publish.');
        }

        if ($post->status !== ContentWorkflow::STATUS_APPROVED) {
            return back()->with('error', 'Hanya konten approved yang bisa dipublish.');
        }

        $post->update([
            'status' => ContentWorkflow::STATUS_PUBLISHED,
            'published_at' => now(),
        ]);
        $post->refresh();
        $this->createRevision($post, $user->id, 'Dipublish');

        return back()->with('success', 'Postingan berhasil dipublish.');
    }

    public function sendBack(Request $request, Post $post): RedirectResponse
    {
        $user = $request->user();

        if (!ContentWorkflow::canSendBack($user)) {
            abort(403, 'Role Anda tidak memiliki akses untuk mengembalikan konten ke draft.');
        }

        if (!in_array($post->status, [ContentWorkflow::STATUS_REVIEW, ContentWorkflow::STATUS_APPROVED, ContentWorkflow::STATUS_PUBLISHED], true)) {
            return back()->with('error', 'Status konten tidak bisa dikembalikan ke draft.');
        }

        $post->update([
            'status' => ContentWorkflow::STATUS_DRAFT,
            'submitted_for_review_at' => null,
            'reviewed_at' => null,
            'approved_at' => null,
            'reviewed_by' => null,
            'approved_by' => null,
            'published_at' => null,
        ]);
        $post->refresh();
        $this->createRevision($post, $user->id, 'Dikembalikan ke draft');

        return back()->with('success', 'Postingan dikembalikan ke draft.');
    }

    public function revisions(Post $post): JsonResponse
    {
        $items = $post->revisions()
            ->with('creator:id,name')
            ->orderByDesc('version')
            ->limit(20)
            ->get()
            ->map(fn (ContentRevision $revision): array => [
                'id' => $revision->id,
                'version' => $revision->version,
                'note' => $revision->note,
                'created_at' => $revision->created_at?->format('Y-m-d H:i:s'),
                'creator' => $revision->creator?->name ?? '-',
            ])
            ->values()
            ->all();

        return response()->json([
            'items' => $items,
        ]);
    }

    public function rollback(Request $request, Post $post, ContentRevision $revision): RedirectResponse
    {
        if (
            $revision->revisionable_type !== Post::class
            || (int) $revision->revisionable_id !== (int) $post->id
        ) {
            abort(404);
        }

        $snapshot = $revision->snapshot;
        if (!is_array($snapshot) || $snapshot === []) {
            return back()->with('error', 'Snapshot revisi tidak valid.');
        }

        $post->update($this->extractPostSnapshotPayload($snapshot));
        $post->hashtags()->sync((array) ($snapshot['hashtag_ids'] ?? []));
        $post->refresh();

        $this->createRevision(
            $post,
            $request->user()->id,
            "Rollback ke versi #{$revision->version}",
        );

        return back()->with('success', "Postingan di-rollback ke versi #{$revision->version}.");
    }

    public function destroy(Post $post): RedirectResponse
    {
        $post->revisions()->delete();

        if ($post->thumbnail_path && Storage::disk('public')->exists($post->thumbnail_path)) {
            Storage::disk('public')->delete($post->thumbnail_path);
        }

        $post->delete();

        return back()->with('success', 'Postingan berhasil dihapus.');
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,gif,svg', 'max:5120'],
        ]);

        $path = $request->file('image')->store('post-content', 'public');

        return response()->json([
            'url' => Storage::url($path),
        ]);
    }

    private function createRevision(Post $post, ?int $userId, ?string $note = null): void
    {
        $nextVersion = ((int) $post->revisions()->max('version')) + 1;

        $post->revisions()->create([
            'version' => $nextVersion,
            'snapshot' => $this->postSnapshot($post),
            'note' => $note,
            'created_by' => $userId,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function postSnapshot(Post $post): array
    {
        return [
            'user_id' => $post->user_id,
            'category_id' => $post->category_id,
            'title' => $post->title,
            'slug' => $post->slug,
            'excerpt' => $post->excerpt,
            'content' => $post->content,
            'thumbnail_path' => $post->thumbnail_path,
            'meta_description' => $post->meta_description,
            'meta_keywords' => $post->meta_keywords,
            'views_count' => $post->views_count,
            'status' => $post->status,
            'submitted_for_review_at' => $post->submitted_for_review_at?->toDateTimeString(),
            'reviewed_at' => $post->reviewed_at?->toDateTimeString(),
            'approved_at' => $post->approved_at?->toDateTimeString(),
            'reviewed_by' => $post->reviewed_by,
            'approved_by' => $post->approved_by,
            'published_at' => $post->published_at?->toDateTimeString(),
            'hashtag_ids' => $post->hashtags()->pluck('hashtags.id')->values()->all(),
        ];
    }

    /**
     * @param array<string, mixed> $snapshot
     * @return array<string, mixed>
     */
    private function extractPostSnapshotPayload(array $snapshot): array
    {
        return [
            'user_id' => $snapshot['user_id'] ?? null,
            'category_id' => $snapshot['category_id'] ?? null,
            'title' => $snapshot['title'] ?? '',
            'slug' => $snapshot['slug'] ?? '',
            'excerpt' => $snapshot['excerpt'] ?? null,
            'content' => $snapshot['content'] ?? '',
            'thumbnail_path' => $snapshot['thumbnail_path'] ?? null,
            'meta_description' => $snapshot['meta_description'] ?? null,
            'meta_keywords' => $snapshot['meta_keywords'] ?? null,
            'views_count' => (int) ($snapshot['views_count'] ?? 0),
            'status' => $snapshot['status'] ?? ContentWorkflow::STATUS_DRAFT,
            'submitted_for_review_at' => $snapshot['submitted_for_review_at'] ?? null,
            'reviewed_at' => $snapshot['reviewed_at'] ?? null,
            'approved_at' => $snapshot['approved_at'] ?? null,
            'reviewed_by' => $snapshot['reviewed_by'] ?? null,
            'approved_by' => $snapshot['approved_by'] ?? null,
            'published_at' => $snapshot['published_at'] ?? null,
        ];
    }
}
