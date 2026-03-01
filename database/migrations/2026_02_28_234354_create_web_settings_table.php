<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('web_settings', function (Blueprint $table) {
            $table->id();
            $table->string('site_title')->nullable();
            $table->string('slogan')->nullable();
            $table->text('short_description')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('meta_keywords')->nullable();
            $table->string('meta_author')->nullable();
            $table->string('meta_robots')->nullable();
            $table->string('canonical_url')->nullable();

            $table->string('meta_thumbnail_path')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('icon_path')->nullable();
            $table->string('favicon_path')->nullable();

            $table->string('contact_email')->nullable();
            $table->string('contact_phone', 30)->nullable();
            $table->string('whatsapp_number', 30)->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('country')->nullable();
            $table->string('postal_code', 15)->nullable();
            $table->text('google_maps_url')->nullable();

            $table->string('facebook_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->string('youtube_url')->nullable();
            $table->string('tiktok_url')->nullable();
            $table->string('x_url')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('threads_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('web_settings');
    }
};
