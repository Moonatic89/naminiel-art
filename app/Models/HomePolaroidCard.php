<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomePolaroidCard extends Model
{
    protected $fillable = [
        'slug',
        'image_path',
        'translation_key',
        'sort_order',
        'is_active',
        'is_chromatic',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'is_active' => 'boolean',
        'is_chromatic' => 'boolean',
    ];
}
