<?php

use Database\Seeders\HomeFanartCardSeeder;
use Database\Seeders\HomeLuciferCardSeeder;
use Database\Seeders\HomePolaroidCardSeeder;
use Database\Seeders\HomeRoleplayCardSeeder;
use Database\Seeders\HomeSectionSeeder;
use Database\Seeders\QrCodeCardSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $defaults = [
            'home_polaroid_cards' => HomePolaroidCardSeeder::class,
            'home_roleplay_cards' => HomeRoleplayCardSeeder::class,
            'home_lucifer_cards' => HomeLuciferCardSeeder::class,
            'home_fanart_cards' => HomeFanartCardSeeder::class,
            'home_sections' => HomeSectionSeeder::class,
            'qr_code_cards' => QrCodeCardSeeder::class,
        ];

        foreach ($defaults as $table => $seeder) {
            if (! DB::table($table)->exists()) {
                (new $seeder())->run();
            }
        }
    }

    public function down(): void
    {
        // Published content and visit counts must survive a migration rollback.
    }
};
