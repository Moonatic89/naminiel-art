<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('home_translation_overrides', function (Blueprint $table) {
            $table->id();
            $table->string('section_key');
            $table->string('item_key')->nullable();
            $table->string('locale', 8);
            $table->string('field');
            $table->text('value')->nullable();
            $table->timestamps();

            $table->unique(['section_key', 'item_key', 'locale', 'field'], 'home_translation_override_unique');
            $table->index(['section_key', 'locale']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('home_translation_overrides');
    }
};
