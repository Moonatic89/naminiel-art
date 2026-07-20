<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BlogPostController extends Controller
{
    public function index(Request $request)
    {
        $query = BlogPost::query()
            ->when(! $request->user()?->is_admin, fn ($query) => $query->where('is_published', true))
            ->when($request->string('category')->isNotEmpty(), fn ($query) => $query->where('category', $request->string('category')))
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request) {
                $search = $request->string('search');

                $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%")
                        ->orWhere('body', 'like', "%{$search}%");
                });
            });

        return Inertia::render('Blog/Index', [
            'posts' => $query->latest('published_at')->latest()->paginate(10)->withQueryString()->through(fn (BlogPost $post) => $this->present($post)),
            'categories' => BlogPost::query()
                ->when(! $request->user()?->is_admin, fn ($query) => $query->where('is_published', true))
                ->distinct()
                ->orderBy('category')
                ->pluck('category'),
            'filters' => $request->only('category', 'search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Blog/Form', [
            'post' => null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'image' => ['required', 'image', 'max:10240'],
            'image_fit' => ['nullable', 'string', 'max:50'],
            'image_position' => ['nullable', 'string', 'max:50'],
            'is_published' => ['boolean'],
        ]);

        $isPublished = $request->boolean('is_published', true);
        $path = $request->file('image')->store('blog-posts', 'public');

        BlogPost::create([
            ...$validated,
            'image_path' => $path,
            'image_original_name' => $request->file('image')->getClientOriginalName(),
            'image_fit' => $validated['image_fit'] ?? 'cover',
            'image_position' => $validated['image_position'] ?? 'center',
            'is_published' => $isPublished,
            'published_at' => $isPublished ? now() : null,
        ]);

        return redirect()->route('blog.index');
    }

    public function show(BlogPost $blogPost)
    {
        abort_if(! $blogPost->is_published && ! request()->user()?->is_admin, 404);

        return Inertia::render('Blog/Show', [
            'post' => $this->present($blogPost),
        ]);
    }

    public function edit(BlogPost $blogPost)
    {
        return Inertia::render('Blog/Form', [
            'post' => $this->present($blogPost),
        ]);
    }

    public function update(Request $request, BlogPost $blogPost)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'image' => ['nullable', 'image', 'max:10240'],
            'image_fit' => ['nullable', 'string', 'max:50'],
            'image_position' => ['nullable', 'string', 'max:50'],
            'is_published' => ['boolean'],
        ]);

        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($blogPost->image_path);
            $validated['image_path'] = $request->file('image')->store('blog-posts', 'public');
            $validated['image_original_name'] = $request->file('image')->getClientOriginalName();
        }

        $isPublished = $request->boolean('is_published');

        $blogPost->update([
            ...$validated,
            'image_fit' => $validated['image_fit'] ?? 'cover',
            'image_position' => $validated['image_position'] ?? 'center',
            'is_published' => $isPublished,
            'published_at' => $isPublished ? ($blogPost->published_at ?? now()) : null,
        ]);

        return redirect()->route('blog.index');
    }

    public function destroy(BlogPost $blogPost)
    {
        Storage::disk('public')->delete($blogPost->image_path);
        $blogPost->delete();

        return redirect()->route('blog.index');
    }

    private function present(BlogPost $post): array
    {
        return [
            'id' => $post->id,
            'title' => $post->title,
            'category' => $post->category,
            'body' => $post->body,
            'image_url' => $this->imageUrl($post->image_path),
            'image_fit' => $post->image_fit,
            'image_position' => $post->image_position,
            'is_published' => $post->is_published,
            'published_at' => $post->published_at,
            'created_at' => $post->created_at,
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
