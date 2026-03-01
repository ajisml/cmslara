<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class AdminActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'user_name',
        'role_slug',
        'action',
        'method',
        'route_name',
        'url',
        'subject_type',
        'subject_id',
        'subject_label',
        'description',
        'ip_address',
        'user_agent',
        'payload_keys',
    ];

    protected function casts(): array
    {
        return [
            'payload_keys' => 'array',
        ];
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
