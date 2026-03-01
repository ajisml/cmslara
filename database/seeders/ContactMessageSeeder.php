<?php

namespace Database\Seeders;

use App\Models\ContactMessage;
use Illuminate\Database\Seeder;

class ContactMessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ContactMessage::query()->delete();

        for ($i = 1; $i <= 120; $i++) {
            $isRead = fake()->boolean(58);

            ContactMessage::query()->create([
                'name' => fake()->name(),
                'email' => fake()->unique()->safeEmail(),
                'phone_number' => '+62'.fake()->numerify('8###########'),
                'message' => fake()->paragraph(fake()->numberBetween(1, 3)),
                'is_read' => $isRead,
                'read_at' => $isRead ? now()->subDays(fake()->numberBetween(0, 20)) : null,
                'ip_address' => fake()->ipv4(),
                'user_agent' => fake()->userAgent(),
                'source_url' => fake()->boolean(75) ? 'https://example.com/contact' : null,
                'created_at' => now()->subDays(fake()->numberBetween(0, 30)),
                'updated_at' => now(),
            ]);
        }
    }
}
