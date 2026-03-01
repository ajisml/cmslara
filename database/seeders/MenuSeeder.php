<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Menu::query()->delete();

        $home = Menu::query()->create([
            'title' => 'Home',
            'url' => '/',
            'target' => '_self',
            'position' => 0,
            'is_active' => true,
        ]);

        $blog = Menu::query()->create([
            'title' => 'Blog',
            'url' => '/blog',
            'target' => '_self',
            'position' => 1,
            'is_active' => true,
        ]);

        $about = Menu::query()->create([
            'title' => 'Tentang Kami',
            'url' => '/tentang-kami',
            'target' => '_self',
            'position' => 2,
            'is_active' => true,
        ]);

        Menu::query()->create([
            'title' => 'Profil Perusahaan',
            'url' => '/tentang-kami/profil',
            'target' => '_self',
            'parent_id' => $about->id,
            'position' => 0,
            'is_active' => true,
        ]);

        Menu::query()->create([
            'title' => 'Tim',
            'url' => '/tentang-kami/tim',
            'target' => '_self',
            'parent_id' => $about->id,
            'position' => 1,
            'is_active' => true,
        ]);

        Menu::query()->create([
            'title' => 'Kontak',
            'url' => '/kontak',
            'target' => '_self',
            'position' => 3,
            'is_active' => true,
        ]);

        Menu::query()->create([
            'title' => 'Kategori',
            'url' => '/blog/kategori',
            'target' => '_self',
            'parent_id' => $blog->id,
            'position' => 0,
            'is_active' => true,
        ]);

        Menu::query()->create([
            'title' => 'Tag',
            'url' => '/blog/tag',
            'target' => '_self',
            'parent_id' => $blog->id,
            'position' => 1,
            'is_active' => true,
        ]);
    }
}
