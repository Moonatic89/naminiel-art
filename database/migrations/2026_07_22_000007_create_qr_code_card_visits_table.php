<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qr_code_card_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('qr_code_card_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('visits_count')->default(0);
            $table->timestamp('last_visited_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qr_code_card_visits');
    }
};
