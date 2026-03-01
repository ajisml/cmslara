<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\Storage;

class Page extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'content',
        'thumbnail_path',
        'meta_description',
        'meta_keywords',
        'views_count',
        'status',
        'submitted_for_review_at',
        'reviewed_at',
        'approved_at',
        'published_at',
        'reviewed_by',
        'approved_by',
        'is_active',
    ];

    protected $appends = [
        'thumbnail_url',
    ];

    protected function casts(): array
    {
        return [
            'views_count' => 'integer',
            'submitted_for_review_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'approved_at' => 'datetime',
            'published_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        if (blank($this->thumbnail_path)) {
            return null;
        }

        return Storage::url($this->thumbnail_path);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function revisions(): MorphMany
    {
        return $this->morphMany(ContentRevision::class, 'revisionable');
    }
}
