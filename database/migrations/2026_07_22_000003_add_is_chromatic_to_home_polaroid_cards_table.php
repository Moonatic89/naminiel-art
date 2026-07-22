<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('home_polaroid_cards', function (Blueprint $table) {
            if (! Schema::hasColumn('home_polaroid_cards', 'is_chromatic')) {
                $table->boolean('is_chromatic')->default(false)->after('is_active')->index();
            }
        });
    }

    public function down(): void
    {
        Schema::table('home_polaroid_cards', function (Blueprint $table) {
            if (Schema::hasColumn('home_polaroid_cards', 'is_chromatic')) {
                if (DB::getDriverName() === 'sqlite') {
                    DB::statement('drop index if exists home_polaroid_cards_is_chromatic_index');
                } else {
                    $table->dropIndex('home_polaroid_cards_is_chromatic_index');
                }

                $table->dropColumn('is_chromatic');
            }
        });
    }
};
