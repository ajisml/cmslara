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
        Schema::create('admin_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('user_name', 120)->nullable();
            $table->string('role_slug', 40)->nullable()->index();
            $table->string('action', 20)->index();
            $table->string('method', 10);
            $table->string('route_name', 160)->nullable()->index();
            $table->string('url', 255)->nullable();
            $table->string('subject_type', 120)->nullable()->index();
            $table->string('subject_id', 50)->nullable()->index();
            $table->string('subject_label', 190)->nullable();
            $table->text('description')->nullable();
            $table->string('ip_address', 45)->nullable()->index();
            $table->text('user_agent')->nullable();
            $table->json('payload_keys')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_activity_logs');
    }
};
