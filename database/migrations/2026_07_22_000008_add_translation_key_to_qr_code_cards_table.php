<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('qr_code_cards', function (Blueprint $table) {
            $table->string('translation_key')->nullable()->after('slug')->index();
        });
    }

    public function down(): void
    {
        Schema::table('qr_code_cards', function (Blueprint $table) {
            $table->dropColumn('translation_key');
        });
    }
};
