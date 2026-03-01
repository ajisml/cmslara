<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Gallery extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'description',
        'cover_image_path',
        'is_active',
    ];

    protected $appends = [
        'cover_image_url',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function getCoverImageUrlAttribute(): ?string
    {
        if (blank($this->cover_image_path)) {
            return null;
        }

        return Storage::url($this->cover_image_path);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(GalleryImage::class, 'gallery_id')
            ->orderBy('sort_order')
            ->orderByDesc('id');
    }
}
