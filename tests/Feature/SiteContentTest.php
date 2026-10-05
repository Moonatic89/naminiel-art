<?php

namespace Tests\Feature;

use App\Models\HomeSection;
use App\Models\HomeFanartCard;
use App\Models\QrCodeCard;
use App\Models\User;
use Database\Seeders\QrCodeCardSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SiteContentTest extends TestCase
{
    use RefreshDatabase;

    public function test_initial_content_is_available_after_migration(): void
    {
        $this->assertDatabaseHas('home_sections', ['key' => 'fanart']);
        $this->assertDatabaseHas('home_fanart_cards', ['slug' => 'uta-one-piece']);
        $this->assertDatabaseHas('qr_code_cards', ['slug' => 'lauro']);

        $this->get('/')->assertOk();
    }

    public function test_public_qr_card_counts_visits_and_hidden_cards_are_unavailable(): void
    {
        $card = QrCodeCard::query()->where('slug', 'lauro')->firstOrFail();

        $this->get(route('qr-cards.show', $card->code))->assertOk();
        $this->assertDatabaseHas('qr_code_card_visits', [
            'qr_code_card_id' => $card->id,
            'visits_count' => 1,
        ]);

        $card->update(['is_active' => false]);
        $this->get(route('qr-cards.show', $card->code))->assertNotFound();
        $this->assertDatabaseHas('qr_code_card_visits', [
            'qr_code_card_id' => $card->id,
            'visits_count' => 1,
        ]);
    }

    public function test_content_management_requires_an_admin_and_changes_are_preserved(): void
    {
        $card = QrCodeCard::query()->where('slug', 'lauro')->firstOrFail();
        $section = HomeSection::query()->where('key', 'fanart')->firstOrFail();

        $this->get(route('qr-cards.index'))->assertRedirect(route('login'));
        $this->actingAs(User::factory()->create())
            ->get(route('home-manager.index'))
            ->assertForbidden();

        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $this->actingAs($admin)
            ->put(route('home-manager.sections.update', $section->key), ['is_visible' => false])
            ->assertRedirect(route('home-manager.index'));
        $this->assertDatabaseHas('home_sections', ['key' => 'fanart', 'is_visible' => false]);

        $this->put(route('qr-cards.update', $card->id), [
            'code' => 'ChangedCode123',
            'slug' => $card->slug,
            'translation_key' => $card->translation_key,
            'title' => 'Titolo aggiornato',
            'body_html' => '<p>Testo aggiornato</p>',
            'image_path' => $card->image_path,
            'is_active' => true,
        ])->assertRedirect(route('qr-cards.index'));

        (new QrCodeCardSeeder())->run();
        $this->assertDatabaseHas('qr_code_cards', [
            'id' => $card->id,
            'code' => 'ChangedCode123',
            'title' => 'Titolo aggiornato',
            'body_html' => '<p>Testo aggiornato</p>',
        ]);
    }

    public function test_uploaded_home_images_remain_in_public_storage_and_can_be_renamed(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $this->actingAs($admin);

        $this->post(route('home-manager.images.upload', 'fanart'), [
            'image' => UploadedFile::fake()->image('Nuova Illustrazione.png'),
        ])->assertRedirect(route('home-manager.index'));

        Storage::disk('public')->assertExists('home-pools/fanart/nuova-illustrazione.png');

        $card = HomeFanartCard::query()->firstOrFail();
        $card->update(['image_path' => '/storage/home-pools/fanart/nuova-illustrazione.png']);

        $this->put(route('home-manager.images.rename', 'fanart'), [
            'path' => '/storage/home-pools/fanart/nuova-illustrazione.png',
            'new_filename' => 'illustrazione-finale.png',
        ])->assertRedirect(route('home-manager.index'));

        Storage::disk('public')->assertMissing('home-pools/fanart/nuova-illustrazione.png');
        Storage::disk('public')->assertExists('home-pools/fanart/illustrazione-finale.png');
        $this->assertDatabaseHas('home_fanart_cards', [
            'id' => $card->id,
            'image_path' => '/storage/home-pools/fanart/illustrazione-finale.png',
        ]);

        $this->put(route('home-manager.images.rename', 'fanart'), [
            'path' => '/media/home/fanart/fa-01.webp',
            'new_filename' => 'moved.webp',
        ])->assertStatus(422);
    }

    public function test_admin_can_assign_an_uploaded_image_to_a_home_card(): void
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->create(['role' => User::ROLE_ADMIN]));

        $this->post(route('home-manager.images.upload', 'magicalGirls'), [
            'image' => UploadedFile::fake()->image('Luna.png'),
        ])->assertRedirect(route('home-manager.index'));

        $path = '/storage/home-pools/magicalGirls/luna.png';
        $this->put(route('home-manager.images.select', 'magicalGirls'), [
            'slot' => 0,
            'path' => $path,
        ])->assertRedirect(route('home-manager.index'));

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->component('Home')
            ->where('homeSectionImages.magicalGirls.0', $path)
            ->etc());

        $this->put(route('home-manager.images.select', 'magicalGirls'), [
            'slot' => 1,
            'path' => '/media/home/fanart/fa-01.webp',
        ])->assertSessionHasErrors('path');
    }
}
