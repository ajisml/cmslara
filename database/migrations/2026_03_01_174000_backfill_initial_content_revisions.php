<?php

use App\Models\Page;
use App\Models\Post;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (
            !Schema::hasTable('content_revisions')
            || !Schema::hasTable('posts')
            || !Schema::hasTable('pages')
        ) {
            return;
        }

        $now = now();

        DB::table('posts')
            ->orderBy('id')
            ->chunk(200, function ($posts) use ($now): void {
                foreach ($posts as $post) {
                    $exists = DB::table('content_revisions')
                        ->where('revisionable_type', Post::class)
                        ->where('revisionable_id', $post->id)
                        ->exists();

                    if ($exists) {
                        continue;
                    }

                    $hashtagIds = DB::table('hashtag_post')
                        ->where('post_id', $post->id)
                        ->pluck('hashtag_id')
                        ->values()
                        ->all();

                    DB::table('content_revisions')->insert([
                        'revisionable_type' => Post::class,
                        'revisionable_id' => $post->id,
                        'version' => 1,
                        'snapshot' => json_encode([
                            'user_id' => $post->user_id,
                            'category_id' => $post->category_id,
                            'title' => $post->title,
                            'slug' => $post->slug,
                            'excerpt' => $post->excerpt,
                            'content' => $post->content,
                            'thumbnail_path' => $post->thumbnail_path,
                            'meta_description' => $post->meta_description,
                            'meta_keywords' => $post->meta_keywords,
                            'views_count' => (int) $post->views_count,
                            'status' => $post->status,
                            'submitted_for_review_at' => $post->submitted_for_review_at,
                            'reviewed_at' => $post->reviewed_at,
                            'approved_at' => $post->approved_at,
                            'reviewed_by' => $post->reviewed_by,
                            'approved_by' => $post->approved_by,
                            'published_at' => $post->published_at,
                            'hashtag_ids' => $hashtagIds,
                        ], JSON_UNESCAPED_UNICODE),
                        'note' => 'Backfill initial revision',
                        'created_by' => $post->user_id,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            });

        DB::table('pages')
            ->orderBy('id')
            ->chunk(200, function ($pages) use ($now): void {
                foreach ($pages as $page) {
                    $exists = DB::table('content_revisions')
                        ->where('revisionable_type', Page::class)
                        ->where('revisionable_id', $page->id)
                        ->exists();

                    if ($exists) {
                        continue;
                    }

                    DB::table('content_revisions')->insert([
                        'revisionable_type' => Page::class,
                        'revisionable_id' => $page->id,
                        'version' => 1,
                        'snapshot' => json_encode([
                            'user_id' => $page->user_id,
                            'title' => $page->title,
                            'slug' => $page->slug,
                            'content' => $page->content,
                            'thumbnail_path' => $page->thumbnail_path,
                            'meta_description' => $page->meta_description,
                            'meta_keywords' => $page->meta_keywords,
                            'views_count' => (int) $page->views_count,
                            'status' => $page->status,
                            'submitted_for_review_at' => $page->submitted_for_review_at,
                            'reviewed_at' => $page->reviewed_at,
                            'approved_at' => $page->approved_at,
                            'published_at' => $page->published_at,
                            'reviewed_by' => $page->reviewed_by,
                            'approved_by' => $page->approved_by,
                            'is_active' => (bool) $page->is_active,
                        ], JSON_UNESCAPED_UNICODE),
                        'note' => 'Backfill initial revision',
                        'created_by' => $page->user_id,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('content_revisions')) {
            return;
        }

        DB::table('content_revisions')
            ->where('note', 'Backfill initial revision')
            ->delete();
    }
};
