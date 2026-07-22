<?php

namespace Database\Seeders;

use App\Models\HomeRoleplayCard;
use Illuminate\Database\Seeder;

class HomeRoleplayCardSeeder extends Seeder
{
    public function run(): void
    {
        collect([
            ['arcane-performer', '/media/home/character-lab/C&D-01.webp', 'arcanePerformer'],
            ['rune-bound-vow', '/media/home/character-lab/C&D-02.webp', 'runeBoundVow'],
            ['festival-memory', '/media/home/character-lab/C&D-03.webp', 'festivalMemory'],
            ['red-mask-rogue', '/media/home/character-lab/C&D-04.webp', 'redMaskRogue'],
        ])->each(function (array $card, int $index) {
            HomeRoleplayCard::updateOrCreate(
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
