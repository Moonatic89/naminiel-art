<?php

namespace Database\Seeders;

use App\Models\QrCodeCard;
use Illuminate\Database\Seeder;

class QrCodeCardSeeder extends Seeder
{
    /**
     * Seed the QR code card pages while preserving existing visit counters.
     */
    public function run(): void
    {
        $cards = [
            [
                'slug' => 'lauro',
                'code' => 'U2IincCURYHF6yxf',
                'translation_key' => 'lauro',
                'title' => 'Nel Silenzio della Foresta',
                'image_path' => '/media/qr-code-cards/images/lauro.webp',
                'content_file' => 'lauro.html',
            ],
            [
                'slug' => 'primula',
                'code' => '0JfTrCnkPLLv102J',
                'translation_key' => 'primula',
                'title' => 'La Danzatrice del Silenzio',
                'image_path' => '/media/qr-code-cards/images/primula.webp',
                'content_file' => 'primula.html',
            ],
            [
                'slug' => 'tempora',
                'code' => 'eyI7PsUZzkaITiuc',
                'translation_key' => 'tempora',
                'title' => 'Al Confine tra Tempo e Caos',
                'image_path' => '/media/qr-code-cards/images/tempora.webp',
                'content_file' => 'tempora.html',
            ],
            [
                'slug' => 'journey',
                'code' => 'RePPTAtVOMmYhqWj',
                'translation_key' => 'journey',
                'title' => 'Il Crepuscolo dei Destini',
                'image_path' => '/media/qr-code-cards/images/journey.webp',
                'content_file' => 'journey.html',
            ],
            [
                'slug' => 'kumi-ven',
                'code' => 'zUx1xzYLhDlLxwRB',
                'translation_key' => 'kumiVen',
                'title' => 'Verso il Mondo da Cambiare',
                'image_path' => '/media/qr-code-cards/images/kumi-ven.webp',
                'content_file' => 'kumi-ven.html',
            ],
            [
                'slug' => 'charlie-incubo',
                'code' => '6bDGChY9JiDgObP7',
                'translation_key' => 'charlieIncubo',
                'title' => 'Il Filo Rosso del Destino',
                'image_path' => '/media/qr-code-cards/images/charlie-incubo.webp',
                'content_file' => 'charlie-incubo.html',
            ],
            [
                'slug' => 'pillow',
                'code' => 'bzQ0v1WiAFaJXInX',
                'translation_key' => 'pillow',
                'title' => 'Il suo Cuscino',
                'image_path' => '/media/qr-code-cards/images/pillow.webp',
                'content_file' => 'pillow.html',
            ],
            [
                'slug' => 'christmas',
                'code' => 'Qm7Xa9PLt2ReWc4H',
                'translation_key' => 'christmas',
                'title' => 'Primora - La Festa del Primo Respiro',
                'image_path' => '/media/qr-code-cards/images/christmas.jpg',
                'content_file' => 'christmas.html',
            ],
        ];

        foreach ($cards as $cardData) {
            $contentPath = database_path('seeders/qr-code-card-content/'.$cardData['content_file']);

            $card = QrCodeCard::query()
                ->where('code', $cardData['code'])
                ->orWhere('slug', $cardData['slug'])
                ->first();

            if (! $card) {
                $card = QrCodeCard::create([
                    'code' => $cardData['code'],
                    'slug' => $cardData['slug'],
                    'translation_key' => $cardData['translation_key'],
                    'title' => $cardData['title'],
                    'body_html' => file_get_contents($contentPath),
                    'image_path' => $cardData['image_path'],
                    'is_active' => true,
                ]);
            }

            $card->visitCounter()->firstOrCreate([], ['visits_count' => 0]);
        }
    }
}
