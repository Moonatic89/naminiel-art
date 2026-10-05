<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class QrCodeCard extends Model
{
    protected $fillable = [
        'code',
        'slug',
        'translation_key',
        'title',
        'body_html',
        'image_path',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function getRouteKeyName(): string
    {
        return 'code';
    }

    public function visitCounter(): HasOne
    {
        return $this->hasOne(QrCodeCardVisit::class);
    }
}
