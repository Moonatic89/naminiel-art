<?php

use App\Http\Controllers\ArtworkController;
use App\Http\Controllers\BlogPostController;
use App\Http\Controllers\CommissionRequestController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\HomeManagerController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QrCodeCardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', HomeController::class)->name('home');
Route::get('/about', fn () => Inertia::render('About'))->name('about');
Route::get('/policy', fn () => Inertia::render('Policy'))->name('policy');

Route::get('/blog', [BlogPostController::class, 'index'])->name('blog.index');
Route::get('/blog/{blogPost}', [BlogPostController::class, 'show'])->name('blog.show');
Route::get('/art/{namespace?}', [ArtworkController::class, 'index'])->name('art.index');
Route::get('/art-og', [ArtworkController::class, 'index'])->defaults('namespace', 'og')->name('art.og');
Route::get('/art-fa', [ArtworkController::class, 'index'])->defaults('namespace', 'fa')->name('art.fa');
Route::get('/commission', [CommissionRequestController::class, 'create'])->name('commission.create');
Route::post('/commission', [CommissionRequestController::class, 'store'])->name('commission.store');
Route::get('/cards/{qrCodeCard:code}', [QrCodeCardController::class, 'show'])->name('qr-cards.show');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin/blog/new', [BlogPostController::class, 'create'])->name('blog.create');
    Route::post('/admin/blog', [BlogPostController::class, 'store'])->name('blog.store');
    Route::get('/admin/blog/{blogPost}/edit', [BlogPostController::class, 'edit'])->name('blog.edit');
    Route::put('/admin/blog/{blogPost}', [BlogPostController::class, 'update'])->name('blog.update');
    Route::delete('/admin/blog/{blogPost}', [BlogPostController::class, 'destroy'])->name('blog.destroy');

    Route::get('/admin/art/{namespace}/new', [ArtworkController::class, 'create'])->name('art.create');
    Route::post('/admin/art/{namespace}', [ArtworkController::class, 'store'])->name('art.store');
    Route::get('/admin/artwork/{artwork}/edit', [ArtworkController::class, 'edit'])->name('art.edit');
    Route::put('/admin/artwork/{artwork}', [ArtworkController::class, 'update'])->name('art.update');
    Route::delete('/admin/artwork/{artwork}', [ArtworkController::class, 'destroy'])->name('art.destroy');

    Route::get('/admin/commissions', [CommissionRequestController::class, 'index'])->name('commission.index');

    Route::get('/admin/home', [HomeManagerController::class, 'index'])->name('home-manager.index');
    Route::put('/admin/home/sections/{section:key}', [HomeManagerController::class, 'updateSection'])->name('home-manager.sections.update');
    Route::post('/admin/home/sections/{section:key}/images', [HomeManagerController::class, 'uploadImage'])->name('home-manager.images.upload');
    Route::put('/admin/home/sections/{section:key}/images', [HomeManagerController::class, 'renameImage'])->name('home-manager.images.rename');
    Route::put('/admin/home/sections/{section:key}/images/selection', [HomeManagerController::class, 'selectImage'])->name('home-manager.images.select');
    Route::post('/admin/home/sections/{section:key}/cards', [HomeManagerController::class, 'storeCard'])->name('home-manager.cards.store');
    Route::put('/admin/home/sections/{section:key}/cards/{card}', [HomeManagerController::class, 'updateCard'])->name('home-manager.cards.update');
    Route::delete('/admin/home/sections/{section:key}/cards/{card}', [HomeManagerController::class, 'destroyCard'])->name('home-manager.cards.destroy');
    Route::put('/admin/home/sections/{section:key}/texts', [HomeManagerController::class, 'updateText'])->name('home-manager.texts.update');

    Route::get('/admin/qr-cards', [QrCodeCardController::class, 'index'])->name('qr-cards.index');
    Route::post('/admin/qr-cards', [QrCodeCardController::class, 'store'])->name('qr-cards.store');
    Route::put('/admin/qr-cards/{qrCodeCard:id}', [QrCodeCardController::class, 'update'])->name('qr-cards.update');
    Route::delete('/admin/qr-cards/{qrCodeCard:id}', [QrCodeCardController::class, 'destroy'])->name('qr-cards.destroy');
});

require __DIR__.'/auth.php';
