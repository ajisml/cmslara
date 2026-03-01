<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Hashtag extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'views_count',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'views_count' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'hashtag_post')
            ->withTimestamps();
    }
}
