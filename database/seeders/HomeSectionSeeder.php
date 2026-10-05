<?php

namespace Database\Seeders;

use App\Models\HomeSection;
use Illuminate\Database\Seeder;

class HomeSectionSeeder extends Seeder
{
    public function run(): void
    {
        $sections = [
            ['key' => 'solcatempoDawn', 'label' => 'Solcatempo Dawn', 'pool_directory' => 'media/home/solcatempo', 'card_table' => null],
            ['key' => 'vestara', 'label' => 'Vestara', 'pool_directory' => 'media/home/vestara', 'card_table' => null],
            ['key' => 'benandanti', 'label' => 'Benandanti', 'pool_directory' => 'media/benandanti', 'card_table' => null],
            ['key' => 'polaroids', 'label' => 'In viaggio', 'pool_directory' => 'media/home/polaroids', 'card_table' => 'home_polaroid_cards'],
            ['key' => 'magicalGirls', 'label' => 'Magikal Girls', 'pool_directory' => 'media/home/magical-girls', 'card_table' => null],
            ['key' => 'roleplay', 'label' => 'Customs & Dragons', 'pool_directory' => 'media/home/character-lab', 'card_table' => 'home_roleplay_cards'],
            ['key' => 'lucifer', 'label' => 'Project Lucifer', 'pool_directory' => 'media/home/lucifer', 'card_table' => 'home_lucifer_cards'],
            ['key' => 'pamsticceria', 'label' => 'Pamsticceria', 'pool_directory' => 'media/home/pamsticceria', 'card_table' => null],
            ['key' => 'characterLab', 'label' => 'Character Lab', 'pool_directory' => 'media/home/character-lab-extra', 'card_table' => null],
            ['key' => 'oc', 'label' => 'OC', 'pool_directory' => 'media/home/oc', 'card_table' => null],
            ['key' => 'fanart', 'label' => 'Fanart', 'pool_directory' => 'media/home/fanart', 'card_table' => 'home_fanart_cards'],
        ];

        foreach ($sections as $index => $section) {
            $homeSection = HomeSection::firstOrNew(['key' => $section['key']]);

            $homeSection->fill([
                ...$section,
                'sort_order' => $index + 1,
            ]);

            if (! $homeSection->exists) {
                $homeSection->is_visible = true;
            }

            $homeSection->save();
        }
    }
}
