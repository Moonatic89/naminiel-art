<?php

namespace Database\Seeders;

use App\Models\HomeLuciferCard;
use Illuminate\Database\Seeder;

class HomeLuciferCardSeeder extends Seeder
{
    public function run(): void
    {
        collect([
            ['fallen-monument', '/media/home/lucifer/pl-01.webp', 'fallenMonument'],
        ])->each(function (array $card, int $index) {
            HomeLuciferCard::updateOrCreate(
                ['slug' => $card[0]],
                [
                    'image_path' => $card[1],
                    'translation_key' => $card[2],
                    'sort_order' => $index + 1,
                    'is_active' => true,
                ],
            );
        });
    }
}
