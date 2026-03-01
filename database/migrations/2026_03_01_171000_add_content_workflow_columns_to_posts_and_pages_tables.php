<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('posts', 'submitted_for_review_at')) {
            Schema::table('posts', function (Blueprint $table): void {
                $table->timestamp('submitted_for_review_at')->nullable()->after('status');
                $table->timestamp('reviewed_at')->nullable()->after('submitted_for_review_at');
                $table->timestamp('approved_at')->nullable()->after('reviewed_at');
                $table->foreignId('reviewed_by')
                    ->nullable()
                    ->after('approved_at')
                    ->constrained('users')
                    ->nullOnDelete();
                $table->foreignId('approved_by')
                    ->nullable()
                    ->after('reviewed_by')
                    ->constrained('users')
                    ->nullOnDelete();
            });
        }

        if (!Schema::hasColumn('pages', 'status')) {
            Schema::table('pages', function (Blueprint $table): void {
                $table->string('status', 20)->default('draft')->index()->after('views_count');
                $table->timestamp('submitted_for_review_at')->nullable()->after('status');
                $table->timestamp('reviewed_at')->nullable()->after('submitted_for_review_at');
                $table->timestamp('approved_at')->nullable()->after('reviewed_at');
                $table->timestamp('published_at')->nullable()->after('approved_at');
                $table->foreignId('reviewed_by')
                    ->nullable()
                    ->after('published_at')
                    ->constrained('users')
                    ->nullOnDelete();
                $table->foreignId('approved_by')
                    ->nullable()
                    ->after('reviewed_by')
                    ->constrained('users')
                    ->nullOnDelete();
            });
        }

        // Backfill page workflow status from legacy is_active flag.
        if (Schema::hasColumn('pages', 'status') && Schema::hasColumn('pages', 'is_active')) {
            DB::table('pages')
                ->where('is_active', true)
                ->update(['status' => 'published']);

            DB::table('pages')
                ->where('is_active', true)
                ->whereNull('published_at')
                ->update(['published_at' => DB::raw('updated_at')]);

            DB::table('pages')
                ->where('is_active', false)
                ->where('status', 'published')
                ->update(['status' => 'draft']);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('posts', 'approved_by')) {
            Schema::table('posts', function (Blueprint $table): void {
                $table->dropConstrainedForeignId('approved_by');
                $table->dropConstrainedForeignId('reviewed_by');
                $table->dropColumn([
                    'submitted_for_review_at',
                    'reviewed_at',
                    'approved_at',
                ]);
            });
        }

        if (Schema::hasColumn('pages', 'approved_by')) {
            Schema::table('pages', function (Blueprint $table): void {
                $table->dropConstrainedForeignId('approved_by');
                $table->dropConstrainedForeignId('reviewed_by');
                $table->dropColumn([
                    'status',
                    'submitted_for_review_at',
                    'reviewed_at',
                    'approved_at',
                    'published_at',
                ]);
            });
        }
    }
};
