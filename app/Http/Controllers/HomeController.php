<?php

namespace App\Http\Controllers;

use App\Models\HomePolaroidCard;
use App\Models\HomeLuciferCard;
use App\Models\HomeRoleplayCard;
use App\Models\HomeFanartCard;
use App\Models\HomeSection;
use App\Models\HomeTranslationOverride;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Home', [
            'homeSections' => $this->sections(),
            'homeSectionImages' => $this->sectionImages(),
            'homeTranslationOverrides' => $this->translationOverrides(),
            'polaroidCards' => $this->polaroidCards(),
            'roleplayCards' => $this->roleplayCards(),
            'luciferCards' => $this->luciferCards(),
            'fanartCards' => $this->fanartCards(),
        ]);
    }

    private function sections(): array
    {
        try {
            if (! Schema::hasTable('home_sections')) {
                return [];
            }

            return HomeSection::query()
                ->get(['key', 'is_visible'])
                ->mapWithKeys(fn (HomeSection $section) => [$section->key => $section->is_visible])
                ->all();
        } catch (\Throwable) {
            return [];
        }
    }

    private function translationOverrides(): array
    {
        try {
            if (! Schema::hasTable('home_translation_overrides')) {
                return [];
            }

            $overrides = [];

            HomeTranslationOverride::query()
                ->whereNotNull('value')
                ->where('value', '!=', '')
                ->get(['section_key', 'item_key', 'locale', 'field', 'value'])
                ->each(function (HomeTranslationOverride $override) use (&$overrides) {
                    if ($override->item_key) {
                        $overrides[$override->locale][$override->section_key]['cards'][$override->item_key][$override->field] = $override->value;

                        return;
                    }

                    $overrides[$override->locale][$override->section_key][$override->field] = $override->value;
                });

            return $overrides;
        } catch (\Throwable) {
            return [];
        }
    }

    private function sectionImages(): array
    {
        try {
            if (! Schema::hasColumn('home_sections', 'selected_images')) {
                return [];
            }

            return HomeSection::query()
                ->whereNotNull('selected_images')
                ->get(['key', 'selected_images'])
                ->mapWithKeys(fn (HomeSection $section) => [$section->key => $section->selected_images ?? []])
                ->all();
        } catch (\Throwable) {
            return [];
        }
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

            $cards = HomePolaroidCard::query()
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

            return $this->preparePolaroidCards($cards);
        } catch (\Throwable) {
            return $this->fallbackPolaroidCards();
        }
    }

    private function preparePolaroidCards(array $cards): array
    {
        return collect($cards)
            ->reject(fn (array $card) => $card['isChromatic'] || preg_match('/_s\.[^.]+$/i', $card['image_path']))
            ->map(function (array $card) {
                $variantPath = preg_replace('/(\.[^.]+)$/', '_s$1', $card['image_path']);
                $card['variant_image_path'] = $variantPath !== $card['image_path']
                    && str_starts_with($variantPath, '/media/home/polaroids/')
                    && is_file(public_path(ltrim($variantPath, '/')))
                    ? $variantPath
                    : null;

                return $card;
            })
            ->values()
            ->all();
    }

    private function fallbackPolaroidCards(): array
    {
        return $this->preparePolaroidCards([
            ['id' => 'fallback-1', 'slug' => 'asado-desert', 'image_path' => '/media/home/polaroids/polaroid-01.webp', 'translation_key' => 'asadoDesert', 'isChromatic' => false],
            ['id' => 'fallback-2', 'slug' => 'ecruteak-festival', 'image_path' => '/media/home/polaroids/polaroid-02.webp', 'translation_key' => 'ecruteakFestival', 'isChromatic' => false],
            ['id' => 'fallback-3', 'slug' => 'mt-coronet', 'image_path' => '/media/home/polaroids/polaroid-03.webp', 'translation_key' => 'mtCoronet', 'isChromatic' => false],
            ['id' => 'fallback-4', 'slug' => 'azalea-park', 'image_path' => '/media/home/polaroids/polaroid-04.webp', 'translation_key' => 'azaleaPark', 'isChromatic' => false],
            ['id' => 'fallback-5', 'slug' => 'cianwood-hatch', 'image_path' => '/media/home/polaroids/polaroid-05.webp', 'translation_key' => 'cianwoodHatch', 'isChromatic' => false],
            ['id' => 'fallback-6', 'slug' => 'cianwood-shiny', 'image_path' => '/media/home/polaroids/polaroid-05_s.webp', 'translation_key' => 'cianwoodShiny', 'isChromatic' => true],
        ]);
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

    private function fanartCards(): array
    {
        try {
            if (! Schema::hasTable('home_fanart_cards')) {
                return $this->fallbackFanartCards();
            }

            return HomeFanartCard::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(['id', 'slug', 'image_path', 'translation_key'])
                ->map(fn (HomeFanartCard $card) => [
                    'id' => $card->id,
                    'slug' => $card->slug,
                    'image_path' => $card->image_path,
                    'translation_key' => $card->translation_key,
                ])
                ->values()
                ->all();
        } catch (\Throwable) {
            return $this->fallbackFanartCards();
        }
    }

    private function fallbackFanartCards(): array
    {
        return [
            ['id' => 'fallback-fanart-1', 'slug' => 'uta-one-piece', 'image_path' => '/media/home/fanart/fa-01.webp', 'translation_key' => 'utaOnePiece'],
            ['id' => 'fallback-fanart-2', 'slug' => 'luffy-gear-5', 'image_path' => '/media/home/fanart/fa-02.webp', 'translation_key' => 'luffyGearFive'],
            ['id' => 'fallback-fanart-3', 'slug' => 'straw-hat-crew', 'image_path' => '/media/home/fanart/fa-03.webp', 'translation_key' => 'strawHatCrew'],
            ['id' => 'fallback-fanart-4', 'slug' => 'shoyo-hinata', 'image_path' => '/media/home/fanart/fa-04.webp', 'translation_key' => 'shoyoHinata'],
        ];
    }
}
