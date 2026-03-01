<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Category::query()->delete();

        $baseCategories = [
            'Teknologi',
            'Pemrograman',
            'Bisnis',
            'Marketing',
            'Startup',
            'Pendidikan',
            'Kesehatan',
            'Olahraga',
            'Lifestyle',
            'Travel',
            'Kuliner',
            'Keuangan',
        ];

        foreach ($baseCategories as $index => $name) {
            $slug = Str::slug($name);
            $svgPath = "category-images/{$slug}.svg";

            Storage::disk('public')->put($svgPath, $this->makeSvg($name, $index));

            Category::query()->create([
                'name' => $name,
                'slug' => $slug,
                'description' => "Kumpulan konten untuk kategori {$name}.",
                'image_path' => $svgPath,
                'views_count' => fake()->numberBetween(800 + ($index * 120), 20000),
                'is_active' => true,
            ]);
        }

        for ($i = 1; $i <= 38; $i++) {
            $name = Str::title(fake()->unique()->words(fake()->numberBetween(1, 3), true));
            $slug = Str::slug($name)."-{$i}";
            $withImage = fake()->boolean(65);
            $imagePath = null;

            if ($withImage) {
                $imagePath = "category-images/{$slug}.svg";
                Storage::disk('public')->put($imagePath, $this->makeSvg($name, $i + 20));
            }

            Category::query()->create([
                'name' => $name,
                'slug' => $slug,
                'description' => fake()->boolean(80) ? fake()->sentence(12) : null,
                'image_path' => $imagePath,
                'views_count' => fake()->numberBetween(0, 12000),
                'is_active' => fake()->boolean(90),
            ]);
        }
    }

    private function makeSvg(string $label, int $seed): string
    {
        $hue = ($seed * 37) % 360;
        $labelShort = Str::limit($label, 14, '');

        return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl({$hue}, 85%, 60%)"/>
      <stop offset="100%" stop-color="hsl({$hue}, 85%, 45%)"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="48" fill="url(#g)"/>
  <circle cx="420" cy="96" r="64" fill="rgba(255,255,255,0.18)"/>
  <circle cx="96" cy="420" r="84" fill="rgba(255,255,255,0.14)"/>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="44" font-family="Plus Jakarta Sans, Arial, sans-serif" font-weight="700">
    {$labelShort}
  </text>
</svg>
SVG;
    }
}
