<script setup>
import { Head, Link } from '@inertiajs/vue3';
import LazyImage from '@/Components/LazyImage.vue';
import PublicLayout from '@/Layouts/PublicLayout.vue';

defineProps({
    post: Object,
});
</script>

<template>
    <PublicLayout>
        <Head :title="post.title" />

        <main class="min-h-screen bg-white px-4 py-10">
            <article class="mx-auto max-w-3xl">
                <Link :href="route('blog.index')" class="text-sm font-semibold text-neutral-500">Torna al blog</Link>
                <LazyImage :src="post.image_url" :alt="post.title" imgClass="mt-6 max-h-[520px] w-full rounded-xl" :imgStyle="{ objectFit: post.image_fit, objectPosition: post.image_position }" />
                <p class="mt-6 text-sm font-semibold text-rose-700">{{ post.category }}</p>
                <h1 class="mt-2 text-4xl font-bold text-neutral-950">{{ post.title }}</h1>
                <div class="prose prose-neutral mt-8 max-w-none" v-html="post.body"></div>
            </article>
        </main>
    </PublicLayout>
</template>
