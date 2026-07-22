<script setup>
import { Link, router } from '@inertiajs/vue3';
import CookieBanner from '@/Components/CookieBanner.vue';
import { computed } from 'vue';
import { useLocale } from '@/i18n/useLocale';

defineProps({
    noPageOffset: {
        type: Boolean,
        default: false,
    },
});

const { availableLocales, locale, messages, setLocale } = useLocale();

const navItems = computed(() => [
    { href: route('home'), label: messages.value.nav.home, icon: 'H', active: 'home' },
    { href: route('blog.index'), label: messages.value.nav.blog, icon: 'B', active: 'blog.*' },
    { href: route('art.og'), label: messages.value.nav.original, icon: 'O', active: 'art.og' },
    { href: route('art.fa'), label: messages.value.nav.fanArt, icon: 'F', active: 'art.fa' },
    { href: route('commission.create'), label: messages.value.nav.commissions, icon: 'C', active: 'commission.*' },
    { href: route('about'), label: messages.value.nav.about, icon: 'A', active: 'about' },
]);

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

            <div class="flex items-center rounded-2xl bg-neutral-100 p-1 md:flex-col" :aria-label="messages.nav.languageLabel">
                <button
                    v-for="item in availableLocales"
                    :key="item"
                    type="button"
                    class="min-h-8 min-w-8 rounded-xl px-2 text-[10px] font-black uppercase tracking-wide transition"
                    :class="locale === item ? 'bg-white text-rose-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'"
                    :aria-pressed="locale === item"
                    @click="setLocale(item)"
                >
                    {{ item }}
                </button>
            </div>

            <div class="mx-2 h-6 w-px bg-neutral-200 md:mx-0 md:my-1 md:h-px md:w-7" />

            <Link
                v-if="!$page.props.auth.user"
                :href="route('login')"
                :title="messages.nav.login"
                class="flex min-h-11 min-w-11 items-center justify-center rounded-2xl px-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 md:flex-col"
            >
                <span class="text-sm font-bold leading-none">IN</span>
                <span class="mt-0.5 hidden text-[10px] font-semibold uppercase tracking-wide md:block">{{ messages.nav.login }}</span>
            </Link>

            <button
                v-else
                type="button"
                :title="messages.nav.logout"
                class="flex min-h-11 min-w-11 items-center justify-center rounded-2xl px-2 text-neutral-500 transition hover:bg-red-50 hover:text-red-600 md:flex-col"
                @click="logout"
            >
                <span class="text-sm font-bold leading-none">OUT</span>
                <span class="mt-0.5 hidden text-[10px] font-semibold uppercase tracking-wide md:block">{{ messages.nav.logout }}</span>
            </button>
        </nav>

        <div :class="noPageOffset ? '' : 'pt-16 md:pt-0'">
            <slot />
        </div>

        <CookieBanner />
    </div>
</template>
