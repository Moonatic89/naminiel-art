<?php

namespace App\Http\Controllers;

use App\Models\Artwork;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ArtworkController extends Controller
{
    public function index(Request $request, string $namespace = 'main')
    {
        $query = Artwork::query()
            ->where('namespace', $namespace)
            ->when(! $request->user()?->is_admin, fn ($query) => $query->where('is_published', true))
            ->when($request->string('category')->isNotEmpty(), fn ($query) => $query->where('category', $request->string('category')))
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request) {
                $search = $request->string('search');

                $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            });

        return Inertia::render('Art/Index', [
            'namespace' => $namespace,
            'artworks' => $query->latest()->paginate(15)->withQueryString()->through(fn (Artwork $artwork) => $this->present($artwork)),
            'categories' => Artwork::query()
                ->where('namespace', $namespace)
                ->when(! $request->user()?->is_admin, fn ($query) => $query->where('is_published', true))
                ->distinct()
                ->orderBy('category')
                ->pluck('category'),
            'filters' => $request->only('category', 'search'),
        ]);
    }

    public function create(string $namespace = 'main')
    {
        return Inertia::render('Art/Form', [
            'namespace' => $namespace,
            'artwork' => null,
        ]);
    }

    public function store(Request $request, string $namespace = 'main')
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['required', 'image', 'max:10240'],
            'image_fit' => ['nullable', 'string', 'max:50'],
            'image_position' => ['nullable', 'string', 'max:50'],
            'is_published' => ['boolean'],
        ]);

        $path = $request->file('image')->store("artworks/{$namespace}", 'public');

        Artwork::create([
            ...$validated,
            'namespace' => $namespace,
            'image_path' => $path,
            'image_original_name' => $request->file('image')->getClientOriginalName(),
            'image_fit' => $validated['image_fit'] ?? 'cover',
            'image_position' => $validated['image_position'] ?? 'center',
            'is_published' => $request->boolean('is_published', true),
        ]);

        return redirect()->route('art.index', $namespace);
    }

    public function edit(Artwork $artwork)
    {
        return Inertia::render('Art/Form', [
            'namespace' => $artwork->namespace,
            'artwork' => $this->present($artwork),
        ]);
    }

    public function update(Request $request, Artwork $artwork)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:10240'],
            'image_fit' => ['nullable', 'string', 'max:50'],
            'image_position' => ['nullable', 'string', 'max:50'],
            'is_published' => ['boolean'],
        ]);

        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($artwork->image_path);
            $validated['image_path'] = $request->file('image')->store("artworks/{$artwork->namespace}", 'public');
            $validated['image_original_name'] = $request->file('image')->getClientOriginalName();
        }

        $artwork->update([
            ...$validated,
            'image_fit' => $validated['image_fit'] ?? 'cover',
            'image_position' => $validated['image_position'] ?? 'center',
            'is_published' => $request->boolean('is_published'),
        ]);

        return redirect()->route('art.index', $artwork->namespace);
    }

    public function destroy(Artwork $artwork)
    {
        $namespace = $artwork->namespace;

        Storage::disk('public')->delete($artwork->image_path);
        $artwork->delete();

        return redirect()->route('art.index', $namespace);
    }

    private function present(Artwork $artwork): array
    {
        return [
            'id' => $artwork->id,
            'namespace' => $artwork->namespace,
            'title' => $artwork->title,
            'category' => $artwork->category,
            'description' => $artwork->description,
            'image_url' => $this->imageUrl($artwork->image_path),
            'image_fit' => $artwork->image_fit,
            'image_position' => $artwork->image_position,
            'is_published' => $artwork->is_published,
            'created_at' => $artwork->created_at,
        ];
    }

    private function imageUrl(?string $path): string
    {
        if (! $path) {
            return '';
        }

        return Str::startsWith($path, ['http://', 'https://'])
            ? $path
            : Storage::url($path);
    }
}
