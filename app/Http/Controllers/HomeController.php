<?php

namespace App\Http\Controllers;

use App\Models\HomePolaroidCard;
use App\Models\HomeLuciferCard;
use App\Models\HomeRoleplayCard;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Home', [
            'polaroidCards' => $this->polaroidCards(),
            'roleplayCards' => $this->roleplayCards(),
            'luciferCards' => $this->luciferCards(),
        ]);
    }

    private function polaroidCards(): array
    {
        try {
            if (! Schema::hasTable('home_polaroid_cards')) {
                return $this->fallbackPolaroidCards();
            }

            $columns = ['id', 'slug', 'image_path', 'translation_key'];
            $hasChromaticColumn = Schema::hasColumn('home_polaroid_cards', 'is_chromatic');

            if ($hasChromaticColumn) {
                $columns[] = 'is_chromatic';
            }

            return HomePolaroidCard::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get($columns)
                ->map(fn (HomePolaroidCard $card) => [
                    'id' => $card->id,
                    'slug' => $card->slug,
                    'image_path' => $card->image_path,
                    'translation_key' => $card->translation_key,
                    'isChromatic' => $hasChromaticColumn && $card->is_chromatic,
                ])
                ->values()
                ->all();
        } catch (\Throwable) {
            return $this->fallbackPolaroidCards();
        }
    }

    private function fallbackPolaroidCards(): array
    {
        return [
            ['id' => 'fallback-1', 'slug' => 'asado-desert', 'image_path' => '/media/home/polaroids/polaroid-01.webp', 'translation_key' => 'asadoDesert', 'isChromatic' => false],
            ['id' => 'fallback-2', 'slug' => 'ecruteak-festival', 'image_path' => '/media/home/polaroids/polaroid-02.webp', 'translation_key' => 'ecruteakFestival', 'isChromatic' => false],
            ['id' => 'fallback-3', 'slug' => 'mt-coronet', 'image_path' => '/media/home/polaroids/polaroid-03.webp', 'translation_key' => 'mtCoronet', 'isChromatic' => false],
            ['id' => 'fallback-4', 'slug' => 'azalea-park', 'image_path' => '/media/home/polaroids/polaroid-04.webp', 'translation_key' => 'azaleaPark', 'isChromatic' => false],
            ['id' => 'fallback-5', 'slug' => 'cianwood-hatch', 'image_path' => '/media/home/polaroids/polaroid-05.webp', 'translation_key' => 'cianwoodHatch', 'isChromatic' => false],
            ['id' => 'fallback-6', 'slug' => 'cianwood-shiny', 'image_path' => '/media/home/polaroids/polaroid-06.webp', 'translation_key' => 'cianwoodShiny', 'isChromatic' => true],
        ];
    }

    private function roleplayCards(): array
    {
        try {
            if (! Schema::hasTable('home_roleplay_cards')) {
                return $this->fallbackRoleplayCards();
            }

            return HomeRoleplayCard::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(['id', 'slug', 'image_path', 'translation_key'])
                ->map(fn (HomeRoleplayCard $card) => [
                    'id' => $card->id,
                    'slug' => $card->slug,
                    'image_path' => $card->image_path,
                    'translation_key' => $card->translation_key,
                ])
                ->values()
                ->all();
        } catch (\Throwable) {
            return $this->fallbackRoleplayCards();
        }
    }

    private function fallbackRoleplayCards(): array
    {
        return [
            ['id' => 'fallback-roleplay-1', 'slug' => 'arcane-performer', 'image_path' => '/media/home/character-lab/C&D-01.webp', 'translation_key' => 'arcanePerformer'],
            ['id' => 'fallback-roleplay-2', 'slug' => 'rune-bound-vow', 'image_path' => '/media/home/character-lab/C&D-02.webp', 'translation_key' => 'runeBoundVow'],
            ['id' => 'fallback-roleplay-3', 'slug' => 'festival-memory', 'image_path' => '/media/home/character-lab/C&D-03.webp', 'translation_key' => 'festivalMemory'],
            ['id' => 'fallback-roleplay-4', 'slug' => 'red-mask-rogue', 'image_path' => '/media/home/character-lab/C&D-04.webp', 'translation_key' => 'redMaskRogue'],
        ];
    }

    private function luciferCards(): array
    {
        try {
            if (! Schema::hasTable('home_lucifer_cards')) {
                return $this->fallbackLuciferCards();
            }

            return HomeLuciferCard::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(['id', 'slug', 'image_path', 'translation_key'])
                ->map(fn (HomeLuciferCard $card) => [
                    'id' => $card->id,
                    'slug' => $card->slug,
                    'image_path' => $card->image_path,
                    'translation_key' => $card->translation_key,
                ])
                ->values()
                ->all();
        } catch (\Throwable) {
            return $this->fallbackLuciferCards();
        }
    }

    private function fallbackLuciferCards(): array
    {
        return [
            ['id' => 'fallback-lucifer-1', 'slug' => 'fallen-monument', 'image_path' => '/media/home/lucifer/pl-01.webp', 'translation_key' => 'fallenMonument'],
        ];
    }
}
