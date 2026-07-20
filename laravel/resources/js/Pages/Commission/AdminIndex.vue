<script setup>
import { Head } from '@inertiajs/vue3';

defineProps({
    requests: Object,
});
</script>

<template>
    <Head title="Richieste commissione" />

    <main class="min-h-screen bg-neutral-100 px-4 py-10">
        <div class="mx-auto max-w-5xl">
            <h1 class="mb-6 text-3xl font-bold text-neutral-950">Richieste commissione</h1>
            <div class="space-y-4">
                <article v-for="request in requests.data" :key="request.id" class="rounded-xl bg-white p-5 shadow">
                    <div class="flex flex-wrap gap-2 text-sm text-neutral-500">
                        <strong class="text-neutral-900">{{ request.name }}</strong>
                        <span>{{ request.email }}</span>
                        <span>{{ request.type }}</span>
                    </div>
                    <p class="mt-3 whitespace-pre-line text-neutral-700">{{ request.description }}</p>
                </article>
            </div>
        </div>
    </main>
</template>
