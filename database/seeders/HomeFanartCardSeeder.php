<?php

namespace Database\Seeders;

use App\Models\HomeFanartCard;
use Illuminate\Database\Seeder;

class HomeFanartCardSeeder extends Seeder
{
    public function run(): void
    {
        $cards = [
            ['slug' => 'uta-one-piece', 'image_path' => '/media/home/fanart/fa-01.webp', 'translation_key' => 'utaOnePiece'],
            ['slug' => 'luffy-gear-5', 'image_path' => '/media/home/fanart/fa-02.webp', 'translation_key' => 'luffyGearFive'],
            ['slug' => 'straw-hat-crew', 'image_path' => '/media/home/fanart/fa-03.webp', 'translation_key' => 'strawHatCrew'],
            ['slug' => 'shoyo-hinata', 'image_path' => '/media/home/fanart/fa-04.webp', 'translation_key' => 'shoyoHinata'],
            ['slug' => 'hanako-kun', 'image_path' => '/media/home/fanart/fa-05.webp', 'translation_key' => 'hanakoKun'],
            ['slug' => 'frieren-fern-stark', 'image_path' => '/media/home/fanart/fa-06.webp', 'translation_key' => 'frierenFernStark'],
            ['slug' => 'goku-super-saiyan-4', 'image_path' => '/media/home/fanart/fa-07.webp', 'translation_key' => 'gokuSuperSaiyanFour'],
            ['slug' => 'mirko-navigavia', 'image_path' => '/media/home/fanart/fa-08.webp', 'translation_key' => 'mirkoNavigavia'],
            ['slug' => 'hana-chan', 'image_path' => '/media/home/fanart/fa-09.webp', 'translation_key' => 'hanaChan'],
            ['slug' => 'kirito-asuna', 'image_path' => '/media/home/fanart/fa-10.webp', 'translation_key' => 'kiritoAsuna'],
            ['slug' => 'digimon-adventure', 'image_path' => '/media/home/fanart/fa-11.webp', 'translation_key' => 'digimonAdventure'],
            ['slug' => 'anya-forger', 'image_path' => '/media/home/fanart/fa-12.webp', 'translation_key' => 'anyaForger'],
            ['slug' => 'dark-magician-girl', 'image_path' => '/media/home/fanart/fa-13.webp', 'translation_key' => 'darkMagicianGirl'],
            ['slug' => 'arataki-itto-gorou', 'image_path' => '/media/home/fanart/fa-14.webp', 'translation_key' => 'aratakiIttoGorou'],
            ['slug' => 'among-us', 'image_path' => '/media/home/fanart/fa-15.webp', 'translation_key' => 'amongUs'],
            ['slug' => 'neji-hyuga', 'image_path' => '/media/home/fanart/fa-16.webp', 'translation_key' => 'nejiHyuga'],
            ['slug' => 'matron-of-ravens', 'image_path' => '/media/home/fanart/fa-17.webp', 'translation_key' => 'matronOfRavens'],
            ['slug' => 'pokemon-picnic', 'image_path' => '/media/home/fanart/fa-18.webp', 'translation_key' => 'pokemonPicnic'],
            ['slug' => 'umbreon', 'image_path' => '/media/home/fanart/fa-19.webp', 'translation_key' => 'umbreon'],
            ['slug' => 'zack-fair', 'image_path' => '/media/home/fanart/fa-20.webp', 'translation_key' => 'zackFair'],
        ];

        foreach ($cards as $index => $card) {
            $exists = HomeFanartCard::query()
                ->where('slug', $card['slug'])
                ->orWhere('image_path', $card['image_path'])
                ->exists();

            if (! $exists) {
                HomeFanartCard::create([
                    ...$card,
                    'sort_order' => $index + 1,
                    'is_active' => true,
                ]);
            }
        }
    }
}
