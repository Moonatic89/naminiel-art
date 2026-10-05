<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeSection extends Model
{
    protected $fillable = [
        'key',
        'label',
        'pool_directory',
        'card_table',
        'sort_order',
        'is_visible',
        'selected_images',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'is_visible' => 'boolean',
        'selected_images' => 'array',
    ];
}
