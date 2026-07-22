<script setup>
import { Head } from '@inertiajs/vue3';
import PublicLayout from '@/Layouts/PublicLayout.vue';

const avatar = 'https://hqbmfndntgzbgprrbrhm.supabase.co/storage/v1/object/public/nav/nav_venerdi.webp';

const links = [
    { label: 'Solcatempo - Il Battito di Vestara', url: 'https://amzn.eu/d/1s9gbpg', color: '#f59e0b' },
    { label: 'Heram - City Land Comix', url: 'https://www.citylandcomix.com/product/heram', color: '#ef4444' },
    { label: 'Instagram', url: 'https://www.instagram.com/naminiel_art/', color: '#e1306c' },
    { label: 'Ko-fi', url: 'https://ko-fi.com/naminielart', color: '#2980b9' },
    { label: 'Facebook', url: 'https://www.facebook.com/NaminielArt', color: '#1877f2' },
    { label: 'TikTok', url: 'https://www.tiktok.com/@naminielart', color: '#010101' },
    { label: 'Discord - Drakkar di Naminiel', url: 'https://discord.gg/5FSbhStx', color: '#5865f2' },
];
</script>

<template>
    <PublicLayout>
        <Head title="About" />

        <main class="relative min-h-screen overflow-hidden bg-[#fdf4f7] px-4 py-12">
            <div class="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#ff547e]/25 blur-3xl" aria-hidden="true" />
            <div class="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#5bc6d8]/25 blur-3xl" aria-hidden="true" />

            <section class="relative z-10 mx-auto flex max-w-lg flex-col items-center">
                <div class="rounded-full bg-gradient-to-br from-[#ff547e] to-[#5bc6d8] p-1 shadow-xl shadow-rose-300/30">
                    <img :src="avatar" alt="NaminielArt" class="h-28 w-28 rounded-full bg-white object-cover" />
                </div>

                <h1 class="mt-5 text-center text-3xl font-black text-neutral-900">NaminielArt</h1>
                <p class="mt-3 text-center text-sm leading-7 text-neutral-600">
                    Mangaka, gamer e illustratrice italiana. Commissioni aperte, storie in corso e tanta energia fantasy.
                </p>

                <div class="mt-9 flex w-full flex-col gap-3">
                    <a
                        v-for="link in links"
                        :key="link.url"
                        :href="link.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="group flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white px-5 py-4 font-semibold text-neutral-800 shadow-sm transition hover:translate-x-1 hover:shadow-lg"
                        :style="{ '--accent': link.color }"
                    >
                        <span class="h-7 w-1 rounded-full bg-[var(--accent)]" />
                        <span class="flex-1">{{ link.label }}</span>
                        <span class="text-neutral-300 transition group-hover:text-[var(--accent)]">-&gt;</span>
                    </a>
                </div>
            </section>
        </main>
    </PublicLayout>
</template>
