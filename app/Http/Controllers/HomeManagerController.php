<?php

namespace App\Http\Controllers;

use App\Models\HomeLuciferCard;
use App\Models\HomeFanartCard;
use App\Models\HomePolaroidCard;
use App\Models\HomeRoleplayCard;
use App\Models\HomeSection;
use App\Models\HomeTranslationOverride;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class HomeManagerController extends Controller
{
    private const LOCALES = ['it', 'en'];
    private const IMAGE_SLOTS = [
        'magicalGirls' => 4,
        'pamsticceria' => 6,
        'characterLab' => 4,
        'oc' => 4,
    ];

    public function index(): Response
    {
        $this->ensureSections();

        $sections = HomeSection::query()
            ->orderBy('sort_order')
            ->get()
            ->map(fn (HomeSection $section) => [
                'key' => $section->key,
                'label' => $section->label,
                'pool_directory' => $section->pool_directory,
                'card_table' => $section->card_table,
                'is_visible' => $section->is_visible,
                'selected_images' => $section->selected_images ?? [],
                'image_slots' => self::IMAGE_SLOTS[$section->key] ?? 0,
                'text_fields' => $this->sectionTextFields($section->key),
                'pool' => $this->poolFiles($section),
                'cards' => $this->cardsForSection($section),
                'db_manager_url' => $section->card_table ? route('home-manager.index').'#'.$section->key.'-cards' : null,
            ]);

        return Inertia::render('Admin/Home/Index', [
            'sections' => $sections,
            'locales' => self::LOCALES,
            'overrides' => $this->overrides(),
            'availableSections' => array_keys($this->catalog()),
        ]);
    }

    public function updateSection(Request $request, HomeSection $section): RedirectResponse
    {
        $data = $request->validate([
            'is_visible' => ['required', 'boolean'],
        ]);

        $section->update($data);

        return redirect()->route('home-manager.index');
    }

    public function uploadImage(Request $request, HomeSection $section): RedirectResponse
    {
        $request->validate([
            'image' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,gif', 'max:15360'],
        ]);

        abort_unless($section->pool_directory, 422);

        $file = $request->file('image');
        $name = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) ?: 'image';
        $extension = $file->extension();
        $directory = $this->storagePoolDirectory($section);
        $filename = $this->uniqueFilename($directory, "{$name}.{$extension}");

        Storage::disk('public')->putFileAs($directory, $file, $filename);

        return redirect()->route('home-manager.index');
    }

    public function renameImage(Request $request, HomeSection $section): RedirectResponse
    {
        $data = $request->validate([
            'path' => ['required', 'string', 'max:255'],
            'new_filename' => ['required', 'string', 'max:255'],
        ]);

        abort_unless($section->pool_directory, 422);

        $directory = $this->storagePoolDirectory($section);
        $oldPath = $data['path'];
        abort_unless(Str::startsWith($oldPath, "/storage/{$directory}/"), 422);
        $oldName = basename($oldPath);
        abort_unless($oldPath === "/storage/{$directory}/{$oldName}", 422);
        $extension = pathinfo($oldName, PATHINFO_EXTENSION);
        $newBase = Str::slug(pathinfo($data['new_filename'], PATHINFO_FILENAME));
        $newExtension = pathinfo($data['new_filename'], PATHINFO_EXTENSION) ?: $extension;
        abort_unless($newBase && strtolower($newExtension) === strtolower($extension), 422);
        $newName = "{$newBase}.{$extension}";

        $disk = Storage::disk('public');
        abort_unless($disk->exists($directory.'/'.$oldName), 404);
        if ($newName === $oldName) {
            return redirect()->route('home-manager.index');
        }
        abort_if($disk->exists($directory.'/'.$newName), 422, 'File already exists.');

        $disk->move($directory.'/'.$oldName, $directory.'/'.$newName);

        $newPath = "/storage/{$directory}/{$newName}";

        $modelClass = $this->modelForTable($section->card_table);

        if ($modelClass) {
            $modelClass::query()->where('image_path', $oldPath)->update(['image_path' => $newPath]);
        }

        $selectedImages = $section->selected_images ?? [];
        foreach ($selectedImages as &$path) {
            if ($path === $oldPath) {
                $path = $newPath;
            }
        }
        unset($path);
        $section->update(['selected_images' => $selectedImages]);

        return redirect()->route('home-manager.index');
    }

    public function selectImage(Request $request, HomeSection $section): RedirectResponse
    {
        $slotCount = self::IMAGE_SLOTS[$section->key] ?? 0;
        abort_unless($slotCount > 0, 404);

        $data = $request->validate([
            'slot' => ['required', 'integer', 'min:0', 'max:'.($slotCount - 1)],
            'path' => ['nullable', 'string', Rule::in(array_column($this->poolFiles($section), 'path'))],
        ]);

        $selectedImages = $section->selected_images ?? [];
        if ($data['path'] ?? null) {
            $selectedImages[$data['slot']] = $data['path'];
        } else {
            unset($selectedImages[$data['slot']]);
        }

        $section->update(['selected_images' => $selectedImages]);

        return redirect()->route('home-manager.index');
    }

    public function storeCard(Request $request, HomeSection $section): RedirectResponse
    {
        $modelClass = $this->modelForTable($section->card_table);
        abort_unless($modelClass, 404);

        $data = $this->validatedCard($request, $modelClass);
        $modelClass::create($data);

        return redirect()->route('home-manager.index');
    }

    public function updateCard(Request $request, HomeSection $section, int $card): RedirectResponse
    {
        $modelClass = $this->modelForTable($section->card_table);
        abort_unless($modelClass, 404);

        $modelClass::query()->findOrFail($card)->update($this->validatedCard($request, $modelClass, $card));

        return redirect()->route('home-manager.index');
    }

    public function destroyCard(HomeSection $section, int $card): RedirectResponse
    {
        $modelClass = $this->modelForTable($section->card_table);
        abort_unless($modelClass, 404);

        $modelClass::query()->findOrFail($card)->delete();

        return redirect()->route('home-manager.index');
    }

    public function updateText(Request $request, HomeSection $section): RedirectResponse
    {
        $isCardText = $request->filled('item_key');
        $data = $request->validate([
            'locale' => ['required', Rule::in(self::LOCALES)],
            'item_key' => ['nullable', 'string', 'max:120'],
            'field' => ['required', Rule::in($isCardText ? ['title', 'description'] : $this->sectionTextFields($section->key))],
            'value' => ['nullable', 'string'],
        ]);

        if ($isCardText) {
            $modelClass = $this->modelForTable($section->card_table);
            abort_unless($modelClass && $modelClass::query()->where('translation_key', $data['item_key'])->exists(), 422);
        }

        HomeTranslationOverride::updateOrCreate(
            [
                'section_key' => $section->key,
                'item_key' => $data['item_key'] ?? null,
                'locale' => $data['locale'],
                'field' => $data['field'],
            ],
            ['value' => $data['value']]
        );

        return redirect()->route('home-manager.index');
    }

    private function ensureSections(): void
    {
        foreach ($this->catalog() as $index => $section) {
            HomeSection::updateOrCreate(
                ['key' => $section['key']],
                [
                    'label' => $section['label'],
                    'pool_directory' => $section['pool_directory'],
                    'card_table' => $section['card_table'],
                    'sort_order' => $index + 1,
                ]
            );
        }
    }

    private function catalog(): array
    {
        return [
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
    }

    private function sectionTextFields(string $section): array
    {
        return match ($section) {
            'vestara' => ['kicker', 'subtitle'],
            'polaroids' => ['kicker', 'title', 'lead', 'chromaticBadge'],
            'benandanti', 'roleplay', 'lucifer', 'characterLab', 'oc', 'fanart' => ['kicker', 'title', 'body'],
            'solcatempoDawn' => ['kicker', 'body'],
            'magicalGirls', 'pamsticceria' => ['kicker', 'title'],
            default => ['kicker', 'title', 'body'],
        };
    }

    private function poolFiles(HomeSection $section): array
    {
        $poolDirectory = $section->pool_directory;
        if (! $poolDirectory) {
            return [];
        }

        $directory = public_path($poolDirectory);
        $staticFiles = File::isDirectory($directory) ? File::files($directory) : [];
        $storageDirectory = $this->storagePoolDirectory($section);
        $disk = Storage::disk('public');

        $bundled = collect($staticFiles)
            ->filter(fn ($file) => in_array(strtolower($file->getExtension()), ['jpg', 'jpeg', 'png', 'webp', 'gif'], true))
            ->map(fn ($file) => [
                'filename' => $file->getFilename(),
                'path' => '/'.$poolDirectory.'/'.$file->getFilename(),
                'size' => $file->getSize(),
                'editable' => false,
            ]);

        $uploaded = collect($disk->files($storageDirectory))
            ->filter(fn ($path) => in_array(strtolower(pathinfo($path, PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png', 'webp', 'gif'], true))
            ->map(fn ($path) => [
                'filename' => basename($path),
                'path' => '/storage/'.$path,
                'size' => $disk->size($path),
                'editable' => true,
            ]);

        return $bundled->concat($uploaded)
            ->sortBy('filename')
            ->values()
            ->all();
    }

    private function cardsForSection(HomeSection $section): array
    {
        $modelClass = $this->modelForTable($section->card_table);

        if (! $modelClass || ! Schema::hasTable($section->card_table)) {
            return [];
        }

        $query = $modelClass::query()->orderBy('sort_order')->orderBy('id');
        $hasChromatic = Schema::hasColumn($section->card_table, 'is_chromatic');

        return $query->get()->map(fn ($card) => [
            'id' => $card->id,
            'slug' => $card->slug,
            'image_path' => $card->image_path,
            'translation_key' => $card->translation_key,
            'sort_order' => $card->sort_order,
            'is_active' => $card->is_active,
            'is_chromatic' => $hasChromatic ? (bool) $card->is_chromatic : false,
        ])->all();
    }

    private function modelForTable(?string $table): ?string
    {
        return match ($table) {
            'home_polaroid_cards' => HomePolaroidCard::class,
            'home_roleplay_cards' => HomeRoleplayCard::class,
            'home_lucifer_cards' => HomeLuciferCard::class,
            'home_fanart_cards' => HomeFanartCard::class,
            default => null,
        };
    }

    private function validatedCard(Request $request, string $modelClass, ?int $ignoreId = null): array
    {
        $table = (new $modelClass())->getTable();
        $data = $request->validate([
            'slug' => ['required', 'alpha_dash', 'max:120', Rule::unique($table, 'slug')->ignore($ignoreId)],
            'image_path' => ['required', 'string', 'max:255'],
            'translation_key' => ['required', 'alpha_dash', 'max:120'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:65535'],
            'is_active' => ['required', 'boolean'],
            'is_chromatic' => ['nullable', 'boolean'],
        ]);

        if (! Schema::hasColumn($table, 'is_chromatic')) {
            unset($data['is_chromatic']);
        }

        return $data;
    }

    private function overrides(): array
    {
        $overrides = [];

        HomeTranslationOverride::query()
            ->get(['section_key', 'item_key', 'locale', 'field', 'value'])
            ->each(function (HomeTranslationOverride $override) use (&$overrides) {
                $itemKey = $override->item_key ?: '__section';
                $overrides[$override->section_key][$itemKey][$override->locale][$override->field] = $override->value;
            });

        return $overrides;
    }

    private function uniqueFilename(string $directory, string $filename): string
    {
        $base = pathinfo($filename, PATHINFO_FILENAME);
        $extension = pathinfo($filename, PATHINFO_EXTENSION);
        $candidate = $filename;
        $index = 2;

        while (Storage::disk('public')->exists($directory.'/'.$candidate)) {
            $candidate = "{$base}-{$index}.{$extension}";
            $index++;
        }

        return $candidate;
    }

    private function storagePoolDirectory(HomeSection $section): string
    {
        return 'home-pools/'.$section->key;
    }
}
