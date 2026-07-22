<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Artwork extends Model
{
    use HasFactory;

    protected $fillable = [
        'namespace',
        'title',
        'category',
        'description',
        'image_path',
        'image_original_name',
        'image_fit',
        'image_position',
        'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];
}
