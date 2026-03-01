<?php

namespace Database\Seeders;

use App\Models\Page;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Page::query()->delete();
        $authorIds = User::query()->pluck('id')->all();

        $basePages = [
            'Tentang Kami',
            'Visi Misi',
            'Sambutan Direktur',
            'Kontak',
            'Layanan',
            'Syarat & Ketentuan',
            'Kebijakan Privasi',
            'FAQ',
        ];

        foreach ($basePages as $index => $title) {
            $slug = Str::slug($title);
            $thumbPath = "page-thumbnails/{$slug}.svg";
            Storage::disk('public')->put($thumbPath, $this->makeSvg($title, $index));

            Page::query()->create([
                'user_id' => $this->pickAuthorId($authorIds, $index),
                'title' => $title,
                'slug' => $slug,
                'content' => $this->makeContent($title),
                'thumbnail_path' => $thumbPath,
                'meta_description' => "Informasi {$title} dari website resmi kami.",
                'meta_keywords' => implode(', ', [$title, 'cms', 'website', 'informasi']),
                'views_count' => fake()->numberBetween(1200 + ($index * 130), 18000),
                'status' => 'published',
                'submitted_for_review_at' => now()->subDays($index + 3),
                'reviewed_at' => now()->subDays($index + 2),
                'approved_at' => now()->subDays($index + 1),
                'published_at' => now()->subDays($index),
                'is_active' => true,
            ]);
        }

        for ($i = 1; $i <= 32; $i++) {
            $title = Str::title(fake()->words(fake()->numberBetween(2, 5), true));
            $slug = Str::slug($title)."-{$i}";
            $withThumbnail = fake()->boolean(80);
            $thumbnailPath = null;

            if ($withThumbnail) {
                $thumbnailPath = "page-thumbnails/{$slug}.svg";
                Storage::disk('public')->put($thumbnailPath, $this->makeSvg($title, $i + 20));
            }

            $status = fake()->randomElement([
                'draft',
                'draft',
                'review',
                'approved',
                'published',
                'published',
            ]);
            $isPublished = $status === 'published';

            Page::query()->create([
                'user_id' => $this->pickAuthorId($authorIds, $i),
                'title' => $title,
                'slug' => $slug,
                'content' => $this->makeContent($title),
                'thumbnail_path' => $thumbnailPath,
                'meta_description' => fake()->boolean(85) ? fake()->sentence(18) : null,
                'meta_keywords' => fake()->boolean(75) ? implode(', ', fake()->words(5)) : null,
                'views_count' => fake()->numberBetween(0, 15000),
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
                'published_at' => $isPublished
                    ? now()->subDays(fake()->numberBetween(1, 365))
                    : null,
                'is_active' => $isPublished,
            ]);
        }
    }

    private function pickAuthorId(array $authorIds, int $seed): ?int
    {
        if ($authorIds === []) {
            return null;
        }

        return $authorIds[$seed % count($authorIds)];
    }

    private function makeContent(string $title): string
    {
        $intro = fake()->paragraph(3);
        $bodyA = fake()->paragraph(5);
        $bodyB = fake()->paragraph(4);

        return <<<HTML
<h2>{$title}</h2>
<p>{$intro}</p>
<p>{$bodyA}</p>
<ul>
  <li>Informasi detail mengenai {$title}.</li>
  <li>Konten ini bisa diedit melalui Summernote.</li>
  <li>Anda bisa menyisipkan gambar, tabel, dan media lainnya.</li>
</ul>
<p>{$bodyB}</p>
HTML;
    }

    private function makeSvg(string $title, int $seed): string
    {
        $hue = ($seed * 29) % 360;
        $label = Str::limit($title, 18, '');

        return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl({$hue}, 85%, 62%)"/>
      <stop offset="100%" stop-color="hsl({$hue}, 85%, 45%)"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="1040" cy="110" r="110" fill="rgba(255,255,255,0.16)"/>
  <circle cx="160" cy="530" r="120" fill="rgba(255,255,255,0.12)"/>
  <text x="80" y="320" fill="white" font-size="64" font-family="Plus Jakarta Sans, Arial, sans-serif" font-weight="700">
    {$label}
  </text>
</svg>
SVG;
    }
}
