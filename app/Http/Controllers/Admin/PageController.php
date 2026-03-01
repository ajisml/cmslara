<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePageRequest;
use App\Http\Requests\Admin\UpdatePageRequest;
use App\Models\ContentRevision;
use App\Models\Page;
use App\Models\User;
use App\Support\ContentWorkflow;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->query('search', '');
        $authorIdQuery = $request->query('author_id');
        $authorId = is_numeric($authorIdQuery) ? (int) $authorIdQuery : null;
        $status = (string) $request->query('status', '');

        if (!ContentWorkflow::isValidStatus($status)) {
            $status = '';
        }

        $pages = Page::query()
            ->with([
                'author:id,name',
            ])
            ->withCount('revisions')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($innerQuery) use ($search): void {
                    $innerQuery
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('meta_description', 'like', "%{$search}%")
                        ->orWhere('meta_keywords', 'like', "%{$search}%");
                });
            })
            ->when($authorId !== null, function ($query) use ($authorId): void {
                $query->where('user_id', $authorId);
            })
            ->when($status !== '', function ($query) use ($status): void {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Page $page): array => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'content' => $page->content,
                'thumbnail_url' => $page->thumbnail_url,
                'meta_description' => $page->meta_description,
                'meta_keywords' => $page->meta_keywords,
                'views_count' => $page->views_count,
                'status' => $page->status,
                'published_at' => $page->published_at?->format('Y-m-d H:i'),
                'is_active' => $page->is_active,
                'author' => [
                    'id' => $page->author?->id,
                    'name' => $page->author?->name ?? '-',
                ],
                'workflow_actions' => ContentWorkflow::allowedActions(
                    $request->user(),
                    $page->status,
                    $page->user_id,
                ),
                'created_at' => $page->created_at?->format('Y-m-d H:i'),
                'revisions_count' => (int) $page->revisions_count,
            ]);

        $topPages = Page::query()
            ->orderByDesc('views_count')
            ->limit(5)
            ->get(['id', 'title', 'slug', 'views_count', 'thumbnail_path'])
            ->map(fn (Page $page): array => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'views_count' => $page->views_count,
                'thumbnail_url' => $page->thumbnail_url,
            ])
            ->values()
            ->all();

        return Inertia::render('Pages/Index', [
            'pages' => $pages,
            'filters' => [
                'search' => $search,
                'author_id' => $authorId,
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
            'topPages' => $topPages,
            'stats' => [
                'total' => Page::count(),
                'draft' => Page::where('status', ContentWorkflow::STATUS_DRAFT)->count(),
                'review' => Page::where('status', ContentWorkflow::STATUS_REVIEW)->count(),
                'approved' => Page::where('status', ContentWorkflow::STATUS_APPROVED)->count(),
                'published' => Page::where('status', ContentWorkflow::STATUS_PUBLISHED)->count(),
                'views' => (int) Page::sum('views_count'),
            ],
        ]);
    }

    public function store(StorePageRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['user_id'] = $request->user()->id;

        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail_path'] = $request->file('thumbnail')->store('page-thumbnails', 'public');
        }

        $validated['status'] = ContentWorkflow::STATUS_DRAFT;
        $validated['submitted_for_review_at'] = null;
        $validated['reviewed_at'] = null;
        $validated['approved_at'] = null;
        $validated['published_at'] = null;
        $validated['reviewed_by'] = null;
        $validated['approved_by'] = null;
        $validated['is_active'] = false;

        unset($validated['thumbnail']);
        $page = Page::create($validated);
        $page->refresh();
        $this->createRevision($page, $request->user()->id, 'Versi awal');

        return back()->with('success', 'Laman berhasil ditambahkan.');
    }

    public function update(UpdatePageRequest $request, Page $page): RedirectResponse
    {
        $validated = $request->validated();

        if ($page->user_id === null) {
            $validated['user_id'] = $request->user()->id;
        }

        if ($request->hasFile('thumbnail')) {
            // Keep previous file so older revisions can still reference it.
            $validated['thumbnail_path'] = $request->file('thumbnail')->store('page-thumbnails', 'public');
        }

        unset($validated['thumbnail']);
        $page->update($validated);
        $page->refresh();
        $this->createRevision($page, $request->user()->id, 'Konten diperbarui');

        return back()->with('success', 'Laman berhasil diperbarui.');
    }

    public function submitReview(Request $request, Page $page): RedirectResponse
    {
        $user = $request->user();

        if (!ContentWorkflow::canSubmitForReview($user, $page->user_id)) {
            abort(403, 'Anda tidak berhak mengajukan laman ini ke review.');
        }

        if ($page->status !== ContentWorkflow::STATUS_DRAFT) {
            return back()->with('error', 'Hanya laman draft yang bisa diajukan ke review.');
        }

        $page->update([
            'status' => ContentWorkflow::STATUS_REVIEW,
            'submitted_for_review_at' => now(),
            'reviewed_at' => null,
            'approved_at' => null,
            'reviewed_by' => null,
            'approved_by' => null,
            'published_at' => null,
            'is_active' => false,
        ]);
        $page->refresh();
        $this->createRevision($page, $user->id, 'Diajukan ke review');

        return back()->with('success', 'Laman berhasil diajukan untuk direview.');
    }

    public function approve(Request $request, Page $page): RedirectResponse
    {
        $user = $request->user();

        if (!ContentWorkflow::canApprove($user)) {
            abort(403, 'Role Anda tidak memiliki akses approval.');
        }

        if ($page->status !== ContentWorkflow::STATUS_REVIEW) {
            return back()->with('error', 'Hanya laman dengan status review yang bisa di-approve.');
        }

        $page->update([
            'status' => ContentWorkflow::STATUS_APPROVED,
            'reviewed_at' => now(),
            'reviewed_by' => $user->id,
            'approved_at' => now(),
            'approved_by' => $user->id,
            'published_at' => null,
            'is_active' => false,
        ]);
        $page->refresh();
        $this->createRevision($page, $user->id, 'Disetujui (approved)');

        return back()->with('success', 'Laman berhasil di-approve.');
    }

    public function publish(Request $request, Page $page): RedirectResponse
    {
        $user = $request->user();

        if (!ContentWorkflow::canPublish($user)) {
            abort(403, 'Role Anda tidak memiliki akses publish.');
        }

        if ($page->status !== ContentWorkflow::STATUS_APPROVED) {
            return back()->with('error', 'Hanya laman approved yang bisa dipublish.');
        }

        $page->update([
            'status' => ContentWorkflow::STATUS_PUBLISHED,
            'published_at' => now(),
            'is_active' => true,
        ]);
        $page->refresh();
        $this->createRevision($page, $user->id, 'Dipublish');

        return back()->with('success', 'Laman berhasil dipublish.');
    }

    public function sendBack(Request $request, Page $page): RedirectResponse
    {
        $user = $request->user();

        if (!ContentWorkflow::canSendBack($user)) {
            abort(403, 'Role Anda tidak memiliki akses untuk mengembalikan laman ke draft.');
        }

        if (!in_array($page->status, [ContentWorkflow::STATUS_REVIEW, ContentWorkflow::STATUS_APPROVED, ContentWorkflow::STATUS_PUBLISHED], true)) {
            return back()->with('error', 'Status laman tidak bisa dikembalikan ke draft.');
        }

        $page->update([
            'status' => ContentWorkflow::STATUS_DRAFT,
            'submitted_for_review_at' => null,
            'reviewed_at' => null,
            'approved_at' => null,
            'reviewed_by' => null,
            'approved_by' => null,
            'published_at' => null,
            'is_active' => false,
        ]);
        $page->refresh();
        $this->createRevision($page, $user->id, 'Dikembalikan ke draft');

        return back()->with('success', 'Laman dikembalikan ke draft.');
    }

    public function revisions(Page $page): JsonResponse
    {
        $items = $page->revisions()
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

    public function rollback(Request $request, Page $page, ContentRevision $revision): RedirectResponse
    {
        if (
            $revision->revisionable_type !== Page::class
            || (int) $revision->revisionable_id !== (int) $page->id
        ) {
            abort(404);
        }

        $snapshot = $revision->snapshot;
        if (!is_array($snapshot) || $snapshot === []) {
            return back()->with('error', 'Snapshot revisi tidak valid.');
        }

        $page->update($this->extractPageSnapshotPayload($snapshot));
        $page->refresh();
        $this->createRevision(
            $page,
            $request->user()->id,
            "Rollback ke versi #{$revision->version}",
        );

        return back()->with('success', "Laman di-rollback ke versi #{$revision->version}.");
    }

    public function destroy(Page $page): RedirectResponse
    {
        $page->revisions()->delete();

        if ($page->thumbnail_path && Storage::disk('public')->exists($page->thumbnail_path)) {
            Storage::disk('public')->delete($page->thumbnail_path);
        }

        $page->delete();

        return back()->with('success', 'Laman berhasil dihapus.');
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,gif,svg', 'max:5120'],
        ]);

        $path = $request->file('image')->store('page-content', 'public');

        return response()->json([
            'url' => Storage::url($path),
        ]);
    }

    private function createRevision(Page $page, ?int $userId, ?string $note = null): void
    {
        $nextVersion = ((int) $page->revisions()->max('version')) + 1;

        $page->revisions()->create([
            'version' => $nextVersion,
            'snapshot' => $this->pageSnapshot($page),
            'note' => $note,
            'created_by' => $userId,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function pageSnapshot(Page $page): array
    {
        return [
            'user_id' => $page->user_id,
            'title' => $page->title,
            'slug' => $page->slug,
            'content' => $page->content,
            'thumbnail_path' => $page->thumbnail_path,
            'meta_description' => $page->meta_description,
            'meta_keywords' => $page->meta_keywords,
            'views_count' => $page->views_count,
            'status' => $page->status,
            'submitted_for_review_at' => $page->submitted_for_review_at?->toDateTimeString(),
            'reviewed_at' => $page->reviewed_at?->toDateTimeString(),
            'approved_at' => $page->approved_at?->toDateTimeString(),
            'published_at' => $page->published_at?->toDateTimeString(),
            'reviewed_by' => $page->reviewed_by,
            'approved_by' => $page->approved_by,
            'is_active' => $page->is_active,
        ];
    }

    /**
     * @param array<string, mixed> $snapshot
     * @return array<string, mixed>
     */
    private function extractPageSnapshotPayload(array $snapshot): array
    {
        return [
            'user_id' => $snapshot['user_id'] ?? null,
            'title' => $snapshot['title'] ?? '',
            'slug' => $snapshot['slug'] ?? '',
            'content' => $snapshot['content'] ?? '',
            'thumbnail_path' => $snapshot['thumbnail_path'] ?? null,
            'meta_description' => $snapshot['meta_description'] ?? null,
            'meta_keywords' => $snapshot['meta_keywords'] ?? null,
            'views_count' => (int) ($snapshot['views_count'] ?? 0),
            'status' => $snapshot['status'] ?? ContentWorkflow::STATUS_DRAFT,
            'submitted_for_review_at' => $snapshot['submitted_for_review_at'] ?? null,
            'reviewed_at' => $snapshot['reviewed_at'] ?? null,
            'approved_at' => $snapshot['approved_at'] ?? null,
            'published_at' => $snapshot['published_at'] ?? null,
            'reviewed_by' => $snapshot['reviewed_by'] ?? null,
            'approved_by' => $snapshot['approved_by'] ?? null,
            'is_active' => (bool) ($snapshot['is_active'] ?? false),
        ];
    }
}
