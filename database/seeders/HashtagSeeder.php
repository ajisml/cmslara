<?php

namespace Database\Seeders;

use App\Models\Hashtag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class HashtagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Hashtag::query()->delete();

        $baseTags = [
            'Laravel',
            'PHP',
            'React',
            'Inertia',
            'Tailwind',
            'JavaScript',
            'MySQL',
            'CMS',
            'Blog',
            'SEO',
            'Tutorial',
            'Tips',
            'Frontend',
            'Backend',
            'DevOps',
            'Security',
            'Performance',
            'Design',
            'UIUX',
            'API',
            'Authentication',
            'Validation',
            'Migration',
            'Seeder',
            'Database',
        ];

        foreach ($baseTags as $index => $name) {
            Hashtag::query()->create([
                'name' => $name,
                'slug' => Str::slug($name),
                'description' => "Konten terkait topik {$name}.",
                'views_count' => fake()->numberBetween(500 + ($index * 50), 15000),
                'is_active' => true,
            ]);
        }

        for ($i = 1; $i <= 75; $i++) {
            $name = fake()->unique()->words(fake()->numberBetween(1, 3), true);

            Hashtag::query()->create([
                'name' => Str::title($name),
                'slug' => Str::slug($name)."-{$i}",
                'description' => fake()->boolean(70) ? fake()->sentence() : null,
                'views_count' => fake()->numberBetween(0, 9000),
                'is_active' => fake()->boolean(88),
            ]);
        }
    }
}
