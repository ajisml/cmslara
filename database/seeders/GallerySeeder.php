<?php

namespace Database\Seeders;

use App\Models\Gallery;
use App\Models\GalleryImage;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GallerySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        GalleryImage::query()->delete();
        Gallery::query()->delete();

        $authorIds = User::query()->pluck('id')->all();

        $baseGalleries = [
            'Kegiatan Sekolah',
            'Workshop Teknologi',
            'Seminar Nasional',
            'Pelatihan Guru',
            'Kunjungan Industri',
            'Lomba Siswa',
            'Program Sosial',
            'Dokumentasi Event',
            'Kegiatan Komunitas',
            'Pameran Karya',
        ];

        foreach ($baseGalleries as $index => $title) {
            $slug = Str::slug($title);
            $coverPath = "gallery-covers/{$slug}.svg";
            Storage::disk('public')->put($coverPath, $this->makeGalleryCoverSvg($title, $index));

            $gallery = Gallery::query()->create([
                'user_id' => $this->pickAuthorId($authorIds, $index),
                'title' => $title,
                'slug' => $slug,
                'description' => "Dokumentasi {$title} yang dapat dikelola dari modul gallery.",
                'cover_image_path' => $coverPath,
                'is_active' => true,
            ]);

            $this->seedGalleryImages($gallery, fake()->numberBetween(6, 12), $index, $authorIds);
        }

        for ($i = 1; $i <= 28; $i++) {
            $title = Str::title(fake()->words(fake()->numberBetween(2, 4), true));
            $slug = Str::slug($title)."-{$i}";
            $withCover = fake()->boolean(78);
            $coverPath = null;

            if ($withCover) {
                $coverPath = "gallery-covers/{$slug}.svg";
                Storage::disk('public')->put($coverPath, $this->makeGalleryCoverSvg($title, $i + 40));
            }

            $gallery = Gallery::query()->create([
                'user_id' => $this->pickAuthorId($authorIds, $i + 1),
                'title' => $title,
                'slug' => $slug,
                'description' => fake()->boolean(80) ? fake()->paragraph() : null,
                'cover_image_path' => $coverPath,
                'is_active' => fake()->boolean(88),
            ]);

            $this->seedGalleryImages($gallery, fake()->numberBetween(2, 10), $i + 90, $authorIds);
        }
    }

    private function seedGalleryImages(
        Gallery $gallery,
        int $count,
        int $seed,
        array $authorIds
    ): void {
        for ($index = 0; $index < $count; $index++) {
            $imageSlug = Str::slug("{$gallery->slug}-{$index}");
            $isWatermarked = fake()->boolean(55);
            $imagePath = "gallery-images/{$imageSlug}.svg";

            Storage::disk('public')->put(
                $imagePath,
                $this->makeGalleryImageSvg(
                    $gallery->title,
                    $seed + $index,
                    $isWatermarked
                )
            );

            GalleryImage::query()->create([
                'gallery_id' => $gallery->id,
                'user_id' => $this->pickAuthorId($authorIds, $seed + $index),
                'title' => fake()->boolean(75) ? "Foto ".($index + 1)." {$gallery->title}" : null,
                'caption' => fake()->boolean(70) ? fake()->sentence(16) : null,
                'alt_text' => fake()->boolean(80) ? "Dokumentasi {$gallery->title} #".($index + 1) : null,
                'image_path' => $imagePath,
                'is_watermarked' => $isWatermarked,
                'sort_order' => $index,
                'is_active' => fake()->boolean(92),
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

    private function makeGalleryCoverSvg(string $title, int $seed): string
    {
        $hue = ($seed * 27) % 360;
        $label = Str::limit($title, 22, '');

        return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl({$hue}, 86%, 62%)"/>
      <stop offset="100%" stop-color="hsl({$hue}, 74%, 45%)"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="1020" cy="90" r="120" fill="rgba(255,255,255,0.18)"/>
  <circle cx="160" cy="530" r="120" fill="rgba(255,255,255,0.14)"/>
  <text x="70" y="330" fill="white" font-size="58" font-family="Plus Jakarta Sans, Arial, sans-serif" font-weight="700">
    {$label}
  </text>
</svg>
SVG;
    }

    private function makeGalleryImageSvg(string $title, int $seed, bool $watermarked): string
    {
        $hue = ($seed * 33) % 360;
        $label = Str::limit($title, 18, '');
        $watermark = $watermarked
            ? '<text x="960" y="610" fill="rgba(255,255,255,0.45)" font-size="24" font-family="Plus Jakarta Sans, Arial, sans-serif" font-weight="700">CMSLARA</text>'
            : '';

        return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl({$hue}, 86%, 64%)"/>
      <stop offset="100%" stop-color="hsl({$hue}, 68%, 45%)"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#g)"/>
  <circle cx="1030" cy="110" r="120" fill="rgba(255,255,255,0.18)"/>
  <circle cx="190" cy="700" r="140" fill="rgba(255,255,255,0.13)"/>
  <text x="70" y="420" fill="white" font-size="62" font-family="Plus Jakarta Sans, Arial, sans-serif" font-weight="700">
    {$label}
  </text>
  {$watermark}
</svg>
SVG;
    }
}
