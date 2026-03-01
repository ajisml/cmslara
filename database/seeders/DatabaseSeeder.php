<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);
        $this->call(MenuSeeder::class);
        $this->call(HashtagSeeder::class);
        $this->call(CategorySeeder::class);

        User::query()->delete();

        User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'superadmin@cmslara.test',
            'phone_number' => '+6281111111111',
            'gender' => 'male',
            'role' => 'superadmin',
            'is_active' => true,
        ]);

        User::factory()->create([
            'name' => 'Admin CMS',
            'email' => 'admin@cmslara.test',
            'phone_number' => '+6282222222222',
            'gender' => 'female',
            'role' => 'admin',
            'is_active' => true,
        ]);

        User::factory()->create([
            'name' => 'Editor CMS',
            'email' => 'editor@cmslara.test',
            'phone_number' => '+6283333333333',
            'gender' => 'other',
            'role' => 'editor',
            'is_active' => true,
        ]);

        User::factory(180)->create();
        User::factory(20)->unverified()->create();

        $this->call(PageSeeder::class);
        $this->call(PostSeeder::class);
        $this->call(GallerySeeder::class);
        $this->call(NotificationSeeder::class);
        $this->call(ContactMessageSeeder::class);
    }
}
