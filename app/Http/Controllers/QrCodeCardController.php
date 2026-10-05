<?php

namespace App\Http\Controllers;

use App\Models\QrCodeCard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class QrCodeCardController extends Controller
{
    public function show(QrCodeCard $qrCodeCard): Response
    {
        abort_unless($qrCodeCard->is_active, 404);

        $counter = $qrCodeCard->visitCounter()->firstOrCreate([], ['visits_count' => 0]);
        $counter->increment('visits_count');
        $counter->forceFill(['last_visited_at' => now()])->save();

        return Inertia::render('QrCards/Show', [
            'card' => [
                'code' => $qrCodeCard->code,
                'translation_key' => $qrCodeCard->translation_key,
                'title' => $qrCodeCard->title,
                'body_html' => $qrCodeCard->body_html,
                'image_path' => $qrCodeCard->image_path,
            ],
        ]);
    }

    public function index(): Response
    {
        $cards = QrCodeCard::query()
            ->with('visitCounter')
            ->orderBy('title')
            ->get()
            ->map(fn (QrCodeCard $card) => [
                'id' => $card->id,
                'code' => $card->code,
                'slug' => $card->slug,
                'translation_key' => $card->translation_key,
                'title' => $card->title,
                'body_html' => $card->body_html,
                'image_path' => $card->image_path,
                'is_active' => $card->is_active,
                'visits_count' => $card->visitCounter?->visits_count ?? 0,
                'last_visited_at' => $card->visitCounter?->last_visited_at?->toDateTimeString(),
                'public_url' => route('qr-cards.show', $card->code),
            ]);

        return Inertia::render('Admin/QrCards/Index', [
            'cards' => $cards,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);
        $data['slug'] = $data['slug'] ?: Str::slug($data['title'].'-'.$data['code']);

        $card = QrCodeCard::create($data);
        $card->visitCounter()->create(['visits_count' => 0]);

        return redirect()->route('qr-cards.index');
    }

    public function update(Request $request, QrCodeCard $qrCodeCard): RedirectResponse
    {
        $data = $this->validatedData($request, $qrCodeCard);
        $data['slug'] = $data['slug'] ?: Str::slug($data['title'].'-'.$data['code']);

        $qrCodeCard->update($data);

        return redirect()->route('qr-cards.index');
    }

    public function destroy(QrCodeCard $qrCodeCard): RedirectResponse
    {
        $qrCodeCard->delete();

        return redirect()->route('qr-cards.index');
    }

    private function validatedData(Request $request, ?QrCodeCard $qrCodeCard = null): array
    {
        return $request->validate([
            'code' => ['required', 'alpha_num', 'max:64', Rule::unique('qr_code_cards', 'code')->ignore($qrCodeCard)],
            'slug' => ['nullable', 'alpha_dash', 'max:120', Rule::unique('qr_code_cards', 'slug')->ignore($qrCodeCard)],
            'translation_key' => ['required', 'alpha_dash', 'max:120'],
            'title' => ['required', 'string', 'max:160'],
            'body_html' => ['required', 'string'],
            'image_path' => ['required', 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
        ]);
    }
}
