<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeTranslationOverride extends Model
{
    protected $fillable = [
        'section_key',
        'item_key',
        'locale',
        'field',
        'value',
    ];
}
