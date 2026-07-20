<?php

namespace App\Console\Commands;

use App\Models\Artwork;
use App\Models\BlogPost;
use Illuminate\Console\Command;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImportSupabaseContent extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:import-supabase-content
        {--only=all : all, posts, or arts}
        {--download-images : Download remote images into Laravel public storage}
        {--dry-run : Show what would be imported without writing records}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import posts and artworks from the old Supabase project';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $supabaseUrl = rtrim(trim((string) env('SUPABASE_URL')), '/');
        $supabaseKey = trim((string) env('SUPABASE_ANON_KEY'));

        if (! $supabaseUrl || ! $supabaseKey) {
            $this->error('Set SUPABASE_URL and SUPABASE_ANON_KEY in .env before importing.');

            return self::FAILURE;
        }

        $only = $this->option('only');
        $dryRun = (bool) $this->option('dry-run');

        if (! in_array($only, ['all', 'posts', 'arts'], true)) {
            $this->error('--only must be one of: all, posts, arts.');

            return self::FAILURE;
        }

        if (in_array($only, ['all', 'posts'], true)) {
            $this->importPosts($supabaseUrl, $supabaseKey, $dryRun);
        }

        if (in_array($only, ['all', 'arts'], true)) {
            $this->importArts($supabaseUrl, $supabaseKey, $dryRun);
        }

        return self::SUCCESS;
    }

    private function importPosts(string $url, string $key, bool $dryRun): void
    {
        $rows = $this->fetchRows($url, $key, 'posts');
        $this->info("Supabase posts found: {$rows->count()}");

        foreach ($rows as $row) {
            $title = (string) Arr::get($row, 'title', 'Untitled');

            if ($dryRun) {
                $this->line("Would import post: {$title}");
                continue;
            }

            $imagePath = $this->resolveImagePath(
                Arr::get($row, 'img'),
                'blog-posts',
                'legacy-post-'.Arr::get($row, 'id', Str::slug($title))
            );

            BlogPost::updateOrCreate(
                ['id' => Arr::get($row, 'id')],
                [
                    'title' => $title,
                    'category' => (string) Arr::get($row, 'category', 'Senza categoria'),
                    'body' => (string) Arr::get($row, 'text', ''),
                    'image_path' => $imagePath,
                    'image_original_name' => basename(parse_url((string) Arr::get($row, 'img'), PHP_URL_PATH) ?: ''),
                    'image_fit' => (string) Arr::get($row, 'img_fit', 'cover'),
                    'image_position' => (string) Arr::get($row, 'img_position', 'center'),
                    'is_published' => Arr::get($row, 'is_published') !== false,
                    'published_at' => Arr::get($row, 'is_published') === false ? null : Arr::get($row, 'created_at'),
                    'created_at' => Arr::get($row, 'created_at') ?: now(),
                    'updated_at' => Arr::get($row, 'updated_at') ?: now(),
                ]
            );

            $this->line("Imported post: {$title}");
        }
    }

    private function importArts(string $url, string $key, bool $dryRun): void
    {
        $rows = $this->fetchRows($url, $key, 'arts');
        $this->info("Supabase artworks found: {$rows->count()}");

        foreach ($rows as $row) {
            $title = (string) Arr::get($row, 'title', 'Untitled');
            $namespace = (string) Arr::get($row, 'namespace', 'main');

            if ($dryRun) {
                $this->line("Would import artwork [{$namespace}]: {$title}");
                continue;
            }

            $imagePath = $this->resolveImagePath(
                Arr::get($row, 'img'),
                "artworks/{$namespace}",
                'legacy-art-'.Arr::get($row, 'id', Str::slug($title))
            );

            Artwork::updateOrCreate(
                ['id' => Arr::get($row, 'id')],
                [
                    'namespace' => $namespace,
                    'title' => $title,
                    'category' => (string) Arr::get($row, 'category', 'Senza categoria'),
                    'description' => Arr::get($row, 'description'),
                    'image_path' => $imagePath,
                    'image_original_name' => (string) Arr::get($row, 'file_name', basename(parse_url((string) Arr::get($row, 'img'), PHP_URL_PATH) ?: '')),
                    'image_fit' => (string) Arr::get($row, 'img_fit', 'cover'),
                    'image_position' => (string) Arr::get($row, 'img_position', 'center'),
                    'is_published' => Arr::get($row, 'is_published') !== false,
                    'created_at' => Arr::get($row, 'created_at') ?: now(),
                    'updated_at' => Arr::get($row, 'updated_at') ?: now(),
                ]
            );

            $this->line("Imported artwork [{$namespace}]: {$title}");
        }
    }

    private function fetchRows(string $url, string $key, string $table)
    {
        $response = Http::withHeaders([
            'apikey' => $key,
            'Authorization' => "Bearer {$key}",
        ])->get("{$url}/rest/v1/{$table}", [
            'select' => '*',
            'order' => 'created_at.desc',
        ]);

        if (! $response->successful()) {
            $this->error("Supabase {$table} request failed: {$response->status()}");
            $this->line($response->body());

            return collect();
        }

        return collect($response->json());
    }

    private function resolveImagePath(?string $remoteUrl, string $directory, string $fallbackName): string
    {
        if (! $remoteUrl) {
            return '';
        }

        if (! $this->option('download-images')) {
            return $remoteUrl;
        }

        $extension = pathinfo(parse_url($remoteUrl, PHP_URL_PATH) ?: '', PATHINFO_EXTENSION) ?: 'jpg';
        $path = trim($directory, '/').'/'.Str::slug($fallbackName).'.'.$extension;

        if (Storage::disk('public')->exists($path)) {
            return $path;
        }

        $response = Http::timeout(30)->get($remoteUrl);

        if (! $response->successful()) {
            $this->warn("Could not download image: {$remoteUrl}");

            return $remoteUrl;
        }

        Storage::disk('public')->put($path, $response->body());

        return $path;
    }
}
