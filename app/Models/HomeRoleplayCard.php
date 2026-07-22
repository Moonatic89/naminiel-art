<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeRoleplayCard extends Model
{
    protected $fillable = [
        'slug',
        'image_path',
        'translation_key',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];
}
