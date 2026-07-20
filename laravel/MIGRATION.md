# Naminiel Laravel Migration

This Laravel/Inertia app is the new full-stack version of the original Vue/Supabase project.

## Local Setup

```bash
composer install
npm install --cache /tmp/npm-cache-naminiel-laravel
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan storage:link
```

For local SQLite, set `DB_CONNECTION=sqlite` and use an absolute `DB_DATABASE` path.

## Create An Admin

```bash
php artisan app:make-admin-user you@example.com --name="Naminiel"
```

If the user already exists, the command promotes it to admin. If not, it asks for a password and creates it.

## Import Supabase Content

Add these values to `.env`:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

Preview without writing:

```bash
php artisan app:import-supabase-content --dry-run
```

Import and download images into Laravel storage:

```bash
php artisan app:import-supabase-content --download-images
```

Import only one area:

```bash
php artisan app:import-supabase-content --only=arts --download-images
php artisan app:import-supabase-content --only=posts --download-images
```

## Current Route Compatibility

The Laravel app exposes `/art-og` and `/art-fa` to match the old Vue routes.
