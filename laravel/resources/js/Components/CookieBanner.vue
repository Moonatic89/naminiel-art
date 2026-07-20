<script setup>
import { Link } from '@inertiajs/vue3';
import { onMounted, ref } from 'vue';

const isVisible = ref(false);
const storageKey = 'naminiel_cookie_ok';

onMounted(() => {
    isVisible.value = localStorage.getItem(storageKey) !== '1';
});

function accept() {
    localStorage.setItem(storageKey, '1');
    isVisible.value = false;
}
</script>

<template>
    <div v-if="isVisible" class="fixed bottom-4 left-4 right-4 z-[120] mx-auto max-w-2xl rounded-xl border border-white/70 bg-white/95 p-4 shadow-2xl backdrop-blur md:left-auto md:right-6">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <p class="text-sm leading-6 text-neutral-700">
                Questo sito usa solo cookie tecnici per funzionare correttamente.
                <Link :href="route('policy')" class="font-semibold text-rose-700">Privacy e cookie policy</Link>.
            </p>
            <button type="button" class="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white sm:ml-auto" @click="accept">
                Ok
            </button>
        </div>
    </div>
</template>
