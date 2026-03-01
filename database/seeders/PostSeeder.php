<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Hashtag;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Post::query()->delete();

        $authorIds = User::query()->pluck('id')->all();
        $categoryIds = Category::query()->pluck('id')->all();
        $hashtagIds = Hashtag::query()->pluck('id')->all();

        $baseTitles = [
            'Panduan SEO On-Page untuk Pemula',
            'Meningkatkan Performa Website dengan Caching',
            'Strategi Konten Blog 30 Hari',
            'Optimasi Gambar untuk Kecepatan Halaman',
            'Checklist Audit Website untuk Bisnis',
            'Belajar Tailwind CSS dari Nol',
            'Tips Menulis Artikel yang Menarik',
            'Cara Memilih Hosting yang Tepat',
            'Membuat Landing Page yang Konversi Tinggi',
            'Teknik Internal Linking yang Efektif',
        ];

        foreach ($baseTitles as $index => $title) {
            $slug = Str::slug($title);
            $thumbnailPath = "post-thumbnails/{$slug}.svg";

            Storage::disk('public')->put($thumbnailPath, $this->makeSvg($title, $index));

            $status = match ($index % 4) {
                0 => 'draft',
                1 => 'review',
                2 => 'approved',
                default => 'published',
            };

            $post = Post::query()->create([
                'user_id' => $this->pick($authorIds, $index),
                'category_id' => $this->pick($categoryIds, $index + 5),
                'title' => $title,
                'slug' => $slug,
                'excerpt' => fake()->sentence(20),
                'content' => $this->makeContent($title),
                'thumbnail_path' => $thumbnailPath,
                'meta_description' => "Artikel {$title} untuk panduan dan praktik terbaik.",
                'meta_keywords' => implode(', ', fake()->words(6)),
                'views_count' => fake()->numberBetween(800 + ($index * 200), 25000),
                'status' => $status,
                'submitted_for_review_at' => in_array($status, ['review', 'approved', 'published'], true)
                    ? now()->subDays($index + 3)
                    : null,
                'reviewed_at' => in_array($status, ['approved', 'published'], true)
                    ? now()->subDays($index + 2)
                    : null,
                'approved_at' => in_array($status, ['approved', 'published'], true)
                    ? now()->subDays($index + 1)
                    : null,
                'published_at' => $status === 'published' ? now()->subDays($index + 1) : null,
            ]);

            $post->hashtags()->sync($this->pickMany($hashtagIds, fake()->numberBetween(2, 5), $index));
        }

        for ($i = 1; $i <= 70; $i++) {
            $title = Str::title(fake()->words(fake()->numberBetween(4, 8), true));
            $slug = Str::slug($title)."-{$i}";
            $withThumbnail = fake()->boolean(70);
            $thumbnailPath = null;

            if ($withThumbnail) {
                $thumbnailPath = "post-thumbnails/{$slug}.svg";
                Storage::disk('public')->put($thumbnailPath, $this->makeSvg($title, $i + 30));
            }

            $status = fake()->randomElement([
                'draft',
                'draft',
                'draft',
                'review',
                'review',
                'approved',
                'approved',
                'published',
                'published',
                'published',
            ]);

            $post = Post::query()->create([
                'user_id' => $this->pick($authorIds, $i + 1),
                'category_id' => fake()->boolean(90) ? $this->pick($categoryIds, $i + 3) : null,
                'title' => $title,
                'slug' => $slug,
                'excerpt' => fake()->boolean(85) ? fake()->sentence(24) : null,
                'content' => $this->makeContent($title),
                'thumbnail_path' => $thumbnailPath,
                'meta_description' => fake()->boolean(80) ? fake()->sentence(18) : null,
                'meta_keywords' => fake()->boolean(75) ? implode(', ', fake()->words(7)) : null,
                'views_count' => fake()->numberBetween(0, 30000),
                'status' => $status,
                'submitted_for_review_at' => in_array($status, ['review', 'approved', 'published'], true)
                    ? now()->subDays(fake()->numberBetween(5, 365))
                    : null,
                'reviewed_at' => in_array($status, ['approved', 'published'], true)
                    ? now()->subDays(fake()->numberBetween(2, 180))
                    : null,
                'approved_at' => in_array($status, ['approved', 'published'], true)
                    ? now()->subDays(fake()->numberBetween(1, 120))
                    : null,
                'published_at' => $status === 'published'
                    ? now()->subDays(fake()->numberBetween(1, 365))
                    : null,
            ]);

            $tagCount = fake()->numberBetween(0, 7);
            if ($tagCount > 0) {
                $post->hashtags()->sync($this->pickMany($hashtagIds, $tagCount, $i + 100));
            }
        }
    }

    private function pick(array $ids, int $seed): ?int
    {
        if ($ids === []) {
            return null;
        }

        return $ids[$seed % count($ids)];
    }

    private function pickMany(array $ids, int $take, int $seed): array
    {
        if ($ids === [] || $take <= 0) {
            return [];
        }

        return collect($ids)
            ->shuffle($seed)
            ->take(min($take, count($ids)))
            ->values()
            ->all();
    }

    private function makeContent(string $title): string
    {
        $intro = fake()->paragraph(3);
        $bodyA = fake()->paragraph(6);
        $bodyB = fake()->paragraph(5);

        return <<<HTML
<h2>{$title}</h2>
<p>{$intro}</p>
<p>{$bodyA}</p>
<blockquote>Gunakan data dan eksperimen untuk meningkatkan performa konten.</blockquote>
<ul>
  <li>Riset kata kunci secara berkala.</li>
  <li>Optimasi struktur heading dan internal link.</li>
  <li>Gunakan gambar yang terkompresi.</li>
</ul>
<p>{$bodyB}</p>
HTML;
    }

    private function makeSvg(string $title, int $seed): string
    {
        $hue = ($seed * 31) % 360;
        $label = Str::limit($title, 24, '');

        return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl({$hue}, 85%, 62%)"/>
      <stop offset="100%" stop-color="hsl({$hue}, 85%, 45%)"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="1050" cy="100" r="120" fill="rgba(255,255,255,0.18)"/>
  <circle cx="130" cy="520" r="120" fill="rgba(255,255,255,0.12)"/>
  <text x="70" y="320" fill="white" font-size="56" font-family="Plus Jakarta Sans, Arial, sans-serif" font-weight="700">
    {$label}
  </text>
</svg>
SVG;
    }
}
