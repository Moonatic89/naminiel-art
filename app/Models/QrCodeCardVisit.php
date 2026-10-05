<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QrCodeCardVisit extends Model
{
    protected $fillable = [
        'qr_code_card_id',
        'visits_count',
        'last_visited_at',
    ];

    protected $casts = [
        'visits_count' => 'integer',
        'last_visited_at' => 'datetime',
    ];

    public function qrCodeCard(): BelongsTo
    {
        return $this->belongsTo(QrCodeCard::class);
    }
}
