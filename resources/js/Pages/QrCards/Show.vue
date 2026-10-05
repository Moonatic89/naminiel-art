<script setup>
import { Head } from '@inertiajs/vue3';
import { computed } from 'vue';
import { useLocale } from '@/i18n/useLocale';

const props = defineProps({
    card: {
        type: Object,
        required: true,
    },
});

const { availableLocales, locale, messages, setLocale } = useLocale();

const translatedCard = computed(() => {
    const bundledTranslation = messages.value.qrCards?.cards?.[props.card.translation_key];

    if (locale.value === 'it' || !bundledTranslation) {
        return {
            title: props.card.title,
            bodyHtml: props.card.body_html,
        };
    }

    return bundledTranslation;
});
</script>

<template>
    <Head :title="translatedCard.title" />

    <main class="qr-card-page">
        <img class="qr-card-bg" :src="card.image_path" alt="" aria-hidden="true" />
        <div class="qr-card-vignette"></div>

        <div class="qr-card-language" :aria-label="messages.qrCards.languageLabel">
            <button
                v-for="availableLocale in availableLocales"
                :key="availableLocale"
                type="button"
                :class="{ active: locale === availableLocale }"
                @click="setLocale(availableLocale)"
            >
                {{ availableLocale.toUpperCase() }}
            </button>
        </div>

        <article class="qr-card-shell">
            <div class="qr-card-art">
                <img :src="card.image_path" :alt="translatedCard.title" />
            </div>

            <div class="qr-card-copy" v-html="translatedCard.bodyHtml"></div>
        </article>
    </main>
</template>

<style scoped>
.qr-card-page {
    position: relative;
    min-height: 100dvh;
    overflow-x: hidden;
    background: #080807;
    color: #f7f1df;
}

.qr-card-bg {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    filter: blur(22px) saturate(0.88) brightness(0.42);
    transform: scale(1.08);
}

.qr-card-vignette {
    position: fixed;
    inset: 0;
    background:
        radial-gradient(circle at 50% 10%, rgba(255, 242, 198, 0.16), transparent 32rem),
        linear-gradient(180deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.76));
}

.qr-card-language {
    position: fixed;
    top: max(1rem, env(safe-area-inset-top));
    right: max(1rem, env(safe-area-inset-right));
    z-index: 3;
    display: flex;
    gap: 0.35rem;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(8, 8, 7, 0.72);
    padding: 0.35rem;
    backdrop-filter: blur(14px);
}

.qr-card-language button {
    min-width: 2.5rem;
    border: 0;
    background: transparent;
    color: rgba(247, 241, 223, 0.68);
    cursor: pointer;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0;
    padding: 0.48rem 0.62rem;
}

.qr-card-language button.active {
    background: #f7f1df;
    color: #080807;
}

.qr-card-shell {
    position: relative;
    z-index: 1;
    display: grid;
    min-height: 100dvh;
    grid-template-columns: minmax(18rem, 0.86fr) minmax(18rem, 1fr);
    gap: clamp(1.5rem, 4vw, 5rem);
    align-items: center;
    width: min(1180px, calc(100% - 2rem));
    margin: 0 auto;
    padding: clamp(2rem, 6vw, 5rem) 0;
}

.qr-card-art {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(12, 13, 10, 0.58);
    box-shadow: 0 1.8rem 5rem rgba(0, 0, 0, 0.42);
    backdrop-filter: blur(14px);
}

.qr-card-art img {
    display: block;
    width: 100%;
    max-height: min(76dvh, 760px);
    object-fit: contain;
}

.qr-card-copy {
    max-height: calc(100dvh - clamp(4rem, 12vw, 10rem));
    overflow-y: auto;
    padding-right: 0.35rem;
}

.qr-card-copy :deep(h1),
.qr-card-copy :deep(h2),
.qr-card-copy :deep(h3) {
    color: #fff8df;
    line-height: 0.96;
    letter-spacing: 0;
}

.qr-card-copy :deep(h1) {
    margin-bottom: 1.2rem;
    font-size: clamp(2.8rem, 9vw, 6.8rem);
    font-family: Georgia, 'Times New Roman', serif;
}

.qr-card-copy :deep(h2) {
    margin: 1.8rem 0 0.8rem;
    font-size: clamp(1.5rem, 4vw, 2.6rem);
    font-family: Georgia, 'Times New Roman', serif;
}

.qr-card-copy :deep(p),
.qr-card-copy :deep(li) {
    color: rgba(247, 241, 223, 0.86);
    font-size: clamp(1rem, 1.7vw, 1.22rem);
    line-height: 1.75;
}

.qr-card-copy :deep(p + p) {
    margin-top: 1rem;
}

.qr-card-copy :deep(strong) {
    color: #fff8df;
}

.qr-card-copy :deep(ul),
.qr-card-copy :deep(ol) {
    margin: 1rem 0 1rem 1.25rem;
}

@media (max-width: 860px) {
    .qr-card-shell {
        grid-template-columns: 1fr;
        align-items: start;
        padding-top: 1rem;
    }

    .qr-card-art img {
        max-height: 58dvh;
    }

    .qr-card-copy {
        max-height: none;
        overflow: visible;
        padding-right: 0;
    }
}
</style>
