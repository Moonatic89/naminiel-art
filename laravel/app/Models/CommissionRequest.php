<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommissionRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'type',
        'description',
        'status',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];
}
