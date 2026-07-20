<script setup>
import { Link, router } from '@inertiajs/vue3';
import CookieBanner from '@/Components/CookieBanner.vue';

defineProps({
    noPageOffset: {
        type: Boolean,
        default: false,
    },
});

const navItems = [
    { href: route('home'), label: 'Home', icon: 'H', active: 'home' },
    { href: route('blog.index'), label: 'Blog', icon: 'B', active: 'blog.*' },
    { href: route('art.og'), label: 'Original', icon: 'O', active: 'art.og' },
    { href: route('art.fa'), label: 'Fan Art', icon: 'F', active: 'art.fa' },
    { href: route('commission.create'), label: 'Commissioni', icon: 'C', active: 'commission.*' },
    { href: route('about'), label: 'About', icon: 'A', active: 'about' },
];

function logout() {
    router.post(route('logout'));
}
</script>

<template>
    <div class="min-h-screen bg-white text-neutral-950">
        <nav class="fixed left-0 top-0 z-50 flex w-full items-center gap-1 border-b border-white/60 bg-white/85 px-3 py-2 shadow-lg backdrop-blur-md md:left-auto md:right-5 md:top-1/2 md:w-auto md:-translate-y-1/2 md:flex-col md:rounded-3xl md:border md:px-3 md:py-4">
            <Link
                v-for="item in navItems"
                :key="item.label"
                :href="item.href"
                :title="item.label"
                class="group flex min-h-11 min-w-11 items-center justify-center rounded-2xl px-2 text-neutral-500 transition hover:bg-rose-50 hover:text-rose-600 md:flex-col"
                :class="{ 'bg-rose-50 text-rose-600': route().current(item.active) }"
            >
                <span class="text-lg leading-none">{{ item.icon }}</span>
                <span class="mt-0.5 hidden text-[10px] font-semibold uppercase tracking-wide md:block">{{ item.label }}</span>
            </Link>

            <div class="mx-2 h-6 w-px bg-neutral-200 md:mx-0 md:my-1 md:h-px md:w-7" />

            <Link
                v-if="!$page.props.auth.user"
                :href="route('login')"
                title="Login"
                class="flex min-h-11 min-w-11 items-center justify-center rounded-2xl px-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 md:flex-col"
            >
                <span class="text-sm font-bold leading-none">IN</span>
                <span class="mt-0.5 hidden text-[10px] font-semibold uppercase tracking-wide md:block">Login</span>
            </Link>

            <button
                v-else
                type="button"
                title="Esci"
                class="flex min-h-11 min-w-11 items-center justify-center rounded-2xl px-2 text-neutral-500 transition hover:bg-red-50 hover:text-red-600 md:flex-col"
                @click="logout"
            >
                <span class="text-sm font-bold leading-none">OUT</span>
                <span class="mt-0.5 hidden text-[10px] font-semibold uppercase tracking-wide md:block">Esci</span>
            </button>
        </nav>

        <div :class="noPageOffset ? '' : 'pt-16 md:pt-0'">
            <slot />
        </div>

        <CookieBanner />
    </div>
</template>
