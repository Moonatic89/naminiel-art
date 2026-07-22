<script setup>
import { Head, Link, router } from '@inertiajs/vue3';
import { reactive } from 'vue';
import LazyImage from '@/Components/LazyImage.vue';
import PublicLayout from '@/Layouts/PublicLayout.vue';

const props = defineProps({
    posts: Object,
    categories: Array,
    filters: Object,
});

const filters = reactive({
    search: props.filters.search || '',
    category: props.filters.category || '',
});

function applyFilters() {
    router.get(route('blog.index'), filters, {
        preserveState: true,
        replace: true,
    });
}
</script>

<template>
    <PublicLayout>
        <Head title="Blog" />

        <main class="min-h-screen bg-white px-4 py-10">
            <div class="mx-auto max-w-6xl">
                <div class="mb-8 flex flex-wrap items-center gap-3">
                    <div class="mr-auto">
                        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">Journal</p>
                        <h1 class="text-3xl font-bold text-neutral-900">Blog</h1>
                    </div>
                    <Link v-if="$page.props.auth.user?.role === 'admin'" :href="route('blog.create')" class="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white">
                        Nuovo post
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

                <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    <article v-for="post in posts.data" :key="post.id" class="overflow-hidden rounded-xl border bg-neutral-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                        <LazyImage :src="post.image_url" :alt="post.title" imgClass="h-56 w-full" :imgStyle="{ objectFit: post.image_fit, objectPosition: post.image_position }" />
                        <div class="p-5">
                            <div class="mb-2 flex items-center gap-2 text-xs text-neutral-500">
                                <span>{{ post.category }}</span>
                                <span v-if="post.is_published === false" class="rounded bg-yellow-100 px-2 py-0.5 text-yellow-800">Bozza</span>
                            </div>
                            <h2 class="text-xl font-bold text-neutral-900">{{ post.title }}</h2>
                            <div class="mt-4 flex gap-3">
                                <Link :href="route('blog.show', post.id)" class="text-sm font-semibold text-rose-700">Leggi</Link>
                                <Link v-if="$page.props.auth.user?.role === 'admin'" :href="route('blog.edit', post.id)" class="text-sm font-semibold text-neutral-600">Modifica</Link>
                            </div>
                        </div>
                    </article>
                </div>

                <p v-if="posts.data.length === 0" class="rounded-xl border border-dashed p-8 text-center text-neutral-500">Nessun post trovato.</p>

                <div class="mt-8 flex flex-wrap gap-2">
                    <Link v-for="link in posts.links" :key="link.label" :href="link.url || '#'" v-html="link.label" class="rounded border px-3 py-1 text-sm" :class="{ 'bg-neutral-900 text-white': link.active, 'pointer-events-none opacity-40': !link.url }" />
                </div>
            </div>
        </main>
    </PublicLayout>
</template>
