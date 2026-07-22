<?php

namespace Database\Seeders;

use App\Models\HomePolaroidCard;
use Illuminate\Database\Seeder;

class HomePolaroidCardSeeder extends Seeder
{
    public function run(): void
    {
        collect([
            ['asado-desert', '/media/home/polaroids/polaroid-01.webp', 'asadoDesert', false],
            ['ecruteak-festival', '/media/home/polaroids/polaroid-02.webp', 'ecruteakFestival', false],
            ['mt-coronet', '/media/home/polaroids/polaroid-03.webp', 'mtCoronet', false],
            ['azalea-park', '/media/home/polaroids/polaroid-04.webp', 'azaleaPark', false],
            ['cianwood-hatch', '/media/home/polaroids/polaroid-05.webp', 'cianwoodHatch', false],
            ['cianwood-shiny', '/media/home/polaroids/polaroid-06.webp', 'cianwoodShiny', true],
        ])->each(function (array $card, int $index) {
            HomePolaroidCard::updateOrCreate(
                ['slug' => $card[0]],
                [
                    'image_path' => $card[1],
                    'translation_key' => $card[2],
                    'sort_order' => $index + 1,
                    'is_active' => true,
                    'is_chromatic' => $card[3],
                ],
            );
        });
    }
}
