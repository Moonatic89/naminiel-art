<script setup>
import { Head, Link, router } from '@inertiajs/vue3';
import { computed, reactive, ref, watch } from 'vue';
import LazyImage from '@/Components/LazyImage.vue';
import PublicLayout from '@/Layouts/PublicLayout.vue';

const props = defineProps({
    namespace: String,
    artworks: Object,
    categories: Array,
    filters: Object,
});

const filters = reactive({
    search: props.filters.search || '',
    category: props.filters.category || '',
});

function applyFilters() {
    router.get(route('art.index', props.namespace), filters, {
        preserveState: true,
        replace: true,
    });
}

const isLightboxOpen = ref(false);
const lightboxIndex = ref(0);
const currentArtwork = computed(() => props.artworks.data[lightboxIndex.value]);

function openLightbox(index) {
    lightboxIndex.value = index;
    isLightboxOpen.value = true;
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    isLightboxOpen.value = false;
    document.body.style.overflow = '';
}

function previousArtwork() {
    if (lightboxIndex.value > 0) {
        lightboxIndex.value -= 1;
    }
}

function nextArtwork() {
    if (lightboxIndex.value < props.artworks.data.length - 1) {
        lightboxIndex.value += 1;
    }
}

watch(isLightboxOpen, (open) => {
    if (!open) {
        document.body.style.overflow = '';
    }
});
</script>

<template>
    <PublicLayout>
        <Head :title="`Gallery ${namespace}`" />

        <main class="min-h-screen bg-white px-4 py-10">
            <div class="mx-auto max-w-7xl">
                <div class="mb-8 flex flex-wrap items-center gap-3">
                    <div class="mr-auto">
                        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">{{ namespace === 'fa' ? 'Fan Art' : 'Original Art' }}</p>
                        <h1 class="text-3xl font-bold text-neutral-900">Gallery</h1>
                    </div>
                    <Link v-if="$page.props.auth.user?.is_admin" :href="route('art.create', namespace)" class="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white">
                        Nuova immagine
                    </Link>
                </div>

                <div class="mb-8 flex flex-wrap gap-2">
                    <button class="rounded-full border px-3 py-1 text-sm" :class="!filters.category ? 'bg-neutral-900 text-white' : ''" @click="filters.category = ''; applyFilters()">
                        Tutte
                    </button>
                    <button v-for="category in categories" :key="category" class="rounded-full border px-3 py-1 text-sm" :class="filters.category === category ? 'bg-neutral-900 text-white' : ''" @click="filters.category = category; applyFilters()">
                        {{ category }}
                    </button>
                    <input v-model="filters.search" type="search" placeholder="Cerca..." class="ml-auto rounded-full border px-4 py-1.5 text-sm" @change="applyFilters" />
                </div>

                <div class="columns-1 gap-4 sm:columns-2 xl:columns-3">
                    <article v-for="(artwork, index) in artworks.data" :key="artwork.id" class="group mb-4 break-inside-avoid overflow-hidden rounded-xl border bg-neutral-50 shadow-sm">
                        <button type="button" class="relative block w-full text-left" @click="openLightbox(index)">
                            <LazyImage :src="artwork.image_url" :alt="artwork.title" imgClass="w-full transition duration-500 group-hover:scale-[1.03]" :imgStyle="{ objectFit: artwork.image_fit, objectPosition: artwork.image_position }" />
                            <div class="absolute inset-0 flex items-end bg-black/0 p-4 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                                <div>
                                    <h2 class="font-bold text-white">{{ artwork.title }}</h2>
                                    <p class="text-sm text-white/80">{{ artwork.category }}</p>
                                </div>
                            </div>
                        </button>
                        <div class="p-4">
                            <div class="mb-1 flex items-center gap-2 text-xs text-neutral-500">
                                <span>{{ artwork.category }}</span>
                                <span v-if="artwork.is_published === false" class="rounded bg-yellow-100 px-2 py-0.5 text-yellow-800">Bozza</span>
                            </div>
                            <h2 class="font-bold text-neutral-900">{{ artwork.title }}</h2>
                            <p v-if="artwork.description" class="mt-1 text-sm text-neutral-600">{{ artwork.description }}</p>
                            <Link v-if="$page.props.auth.user?.is_admin" :href="route('art.edit', artwork.id)" class="mt-3 inline-block text-sm font-semibold text-neutral-600">
                                Modifica
                            </Link>
                        </div>
                    </article>
                </div>

                <p v-if="artworks.data.length === 0" class="rounded-xl border border-dashed p-8 text-center text-neutral-500">Nessuna immagine trovata.</p>

                <div class="mt-8 flex flex-wrap gap-2">
                    <Link v-for="link in artworks.links" :key="link.label" :href="link.url || '#'" v-html="link.label" class="rounded border px-3 py-1 text-sm" :class="{ 'bg-neutral-900 text-white': link.active, 'pointer-events-none opacity-40': !link.url }" />
                </div>
            </div>
        </main>

        <div v-if="isLightboxOpen && currentArtwork" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" @click.self="closeLightbox">
            <button class="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white" @click="closeLightbox">x</button>
            <button v-if="lightboxIndex > 0" class="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white md:flex" @click="previousArtwork">&lt;</button>
            <img :src="currentArtwork.image_url" :alt="currentArtwork.title" class="max-h-[82vh] max-w-full rounded-lg object-contain shadow-2xl" />
            <button v-if="lightboxIndex < artworks.data.length - 1" class="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white md:flex" @click="nextArtwork">&gt;</button>
            <div class="absolute bottom-6 left-4 right-4 text-center text-white">
                <h2 class="text-xl font-bold">{{ currentArtwork.title }}</h2>
                <p class="text-white/70">{{ currentArtwork.category }}</p>
            </div>
        </div>
    </PublicLayout>
</template>
