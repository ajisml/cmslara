<?php

namespace Database\Seeders;

use App\Models\CmsNotification;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CmsNotification::query()->delete();

        $superadminId = User::query()
            ->where('role', 'superadmin')
            ->value('id');

        $baseNotifications = [
            [
                'title' => 'Backup Database Berhasil',
                'message' => 'Backup otomatis malam hari berhasil dan tersimpan di storage cloud.',
                'type' => 'success',
                'target_role' => 'superadmin',
            ],
            [
                'title' => 'Pembaruan Sistem CMS',
                'message' => 'Tersedia pembaruan fitur keamanan. Silakan review changelog.',
                'type' => 'info',
                'target_role' => 'all',
            ],
            [
                'title' => 'Moderasi Konten Menunggu',
                'message' => 'Ada 7 postingan draft yang menunggu persetujuan editor.',
                'type' => 'warning',
                'target_role' => 'editor',
            ],
            [
                'title' => 'Percobaan Login Gagal Berulang',
                'message' => 'Terdeteksi percobaan login gagal berulang pada akun admin tertentu.',
                'type' => 'danger',
                'target_role' => 'superadmin',
            ],
        ];

        foreach ($baseNotifications as $index => $item) {
            CmsNotification::query()->create([
                'created_by' => $superadminId,
                'title' => $item['title'],
                'message' => $item['message'],
                'type' => $item['type'],
                'target_role' => $item['target_role'],
                'link_url' => fake()->boolean(45) ? 'https://example.com/docs/cms-update' : null,
                'is_active' => true,
                'published_at' => now()->subMinutes(($index + 1) * 7),
            ]);
        }

        $roles = ['all', 'superadmin', 'admin', 'editor', 'author', 'viewer'];
        $types = ['info', 'success', 'warning', 'danger'];

        for ($i = 1; $i <= 40; $i++) {
            CmsNotification::query()->create([
                'created_by' => $superadminId,
                'title' => fake()->sentence(fake()->numberBetween(3, 7)),
                'message' => fake()->paragraph(fake()->numberBetween(1, 3)),
                'type' => $types[array_rand($types)],
                'target_role' => $roles[array_rand($roles)],
                'link_url' => fake()->boolean(35)
                    ? 'https://example.com/notification/'.$i
                    : null,
                'is_active' => fake()->boolean(88),
                'published_at' => fake()->boolean(85)
                    ? now()->subDays(fake()->numberBetween(0, 30))
                    : now()->addDays(fake()->numberBetween(1, 7)),
            ]);
        }
    }
}
