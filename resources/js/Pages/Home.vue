<script setup>
import { Head, Link } from '@inertiajs/vue3';
import PublicLayout from '@/Layouts/PublicLayout.vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import cyanWave from '../assets/wave/cyanWave.png';
import redWave from '../assets/wave/redWave.png';
import { useLocale } from '@/i18n/useLocale';
import HomeImageFrame from '@/Components/HomeImageFrame.vue';
import { homeImagePool, selectedHomeImage } from '@/home/imagePool';

const props = defineProps({
    polaroidCards: {
        type: Array,
        default: () => [],
    },
    roleplayCards: {
        type: Array,
        default: () => [],
    },
    luciferCards: {
        type: Array,
        default: () => [],
    },
});

const originalImage = homeImagePool.hero.original[0].src;
const fanArtImage = homeImagePool.hero.fanArt[0].src;
const logoVideo = '/media/hero/naminiel-logo.webm';
const logoPoster = '/media/hero/naminiel-logo-poster.webp';
const interactionsEnabled = false;

const introRevealed = ref(false);
const introDone = ref(false);
const currentState = ref('right');
const introKey = 'naminiel_intro_shown';
let introTimeout = null;
let sectionObserver = null;
let polaroidObserver = null;
let benandantiTimer = null;
let polaroidTimer = null;

const isMobile = ref(false);
const waveDuration = ref('1000ms');
const waveDistance = ref(0);
const wave = ref({
    left: false,
    right: false,
    top: false,
    bottom: false,
    transition: false,
});

const { messages } = useLocale();
const copy = computed(() => messages.value.home);
const sections = computed(() => copy.value.sections);
const activeBenandanteIndex = ref(0);
const benandanti = computed(() => sections.value.benandanti.items);
const activeBenandante = computed(() => benandanti.value[activeBenandanteIndex.value]);
const roleplayCards = computed(() => props.roleplayCards ?? []);
const luciferSlotCount = 4;
const luciferCards = computed(() => limitSectionCards(props.luciferCards ?? [], luciferSlotCount));
const imageModal = ref(null);
const polaroidSection = ref(null);
const polaroidStartIndex = ref(0);
const isPolaroidSectionVisible = ref(false);
const polaroidCards = computed(() => props.polaroidCards ?? []);
const visiblePolaroidCards = computed(() => {
    if (!polaroidCards.value.length) {
        return [];
    }

    return Array.from({ length: Math.min(4, polaroidCards.value.length) }, (_, offset) => {
        const index = (polaroidStartIndex.value + offset) % polaroidCards.value.length;

        return polaroidCards.value[index];
    });
});
const timerPauseReasons = {
    benandanti: new Set(),
    polaroids: new Set(),
};

const gradients = {
    polaroids: [
        'from-[#f7e6b9] via-[#b5e5e0] to-[#f59e7b]',
        'from-[#d8f3c5] via-[#7ccf9b] to-[#335c4b]',
        'from-[#d8e8ff] via-[#778bd8] to-[#242b5f]',
        'from-[#ffe2ea] via-[#ffa7a5] to-[#70404a]',
    ],
    magicalGirls: [
        'from-[#ffbad5] via-[#ffd8f1] to-[#7656d8]',
        'from-[#5d3f8f] via-[#d8b4fe] to-[#fef3c7]',
        'from-[#9ce7ff] via-[#f0abfc] to-[#facc15]',
        'from-[#2e1065] via-[#a855f7] to-[#f5d0fe]',
    ],
    roleplay: [
        'from-[#171717] via-[#3f2f1f] to-[#d6a157]',
        'from-[#34111a] via-[#8f1d35] to-[#ffb86b]',
        'from-[#111827] via-[#374151] to-[#93c5fd]',
        'from-[#201a12] via-[#725f45] to-[#f5e7c4]',
    ],
    lucifer: [
        'from-[#070707] via-[#2a0d0d] to-[#7f1d1d]',
        'from-[#111111] via-[#3a2a21] to-[#c2410c]',
        'from-[#030303] via-[#171717] to-[#a16207]',
        'from-[#09090b] via-[#27272a] to-[#991b1b]',
    ],
    pamsticceria: [
        'from-[#fde68a] via-[#f9a8d4] to-[#fb7185]',
        'from-[#fff7ed] via-[#fdba74] to-[#7c2d12]',
        'from-[#bbf7d0] via-[#86efac] to-[#fef08a]',
        'from-[#fecaca] via-[#fca5a5] to-[#78350f]',
        'from-[#e0f2fe] via-[#fef3c7] to-[#f472b6]',
        'from-[#c4b5fd] via-[#67e8f9] to-[#fb7185]',
    ],
    characterLab: [
        'from-[#e5e7eb] via-[#94a3b8] to-[#111827]',
        'from-[#fef3c7] via-[#f97316] to-[#1f2937]',
        'from-[#dbeafe] via-[#60a5fa] to-[#312e81]',
        'from-[#f5f5f4] via-[#d6d3d1] to-[#292524]',
    ],
    oc: [
        'from-[#111827] via-[#4338ca] to-[#f97316]',
        'from-[#111111] via-[#404040] to-[#fafafa]',
        'from-[#1f2937] via-[#be123c] to-[#f8fafc]',
        'from-[#0f172a] via-[#475569] to-[#f5f5f4]',
    ],
    fanart: [
        'from-[#fafafa] via-[#fca5a5] to-[#111827]',
        'from-[#fef2f2] via-[#f97316] to-[#7f1d1d]',
        'from-[#f8fafc] via-[#38bdf8] to-[#1e293b]',
        'from-[#fff7ed] via-[#facc15] to-[#111827]',
    ],
};

function homeCardImage(section, index) {
    return selectedHomeImage(section, index);
}

function polaroidCopy(card) {
    return sections.value.polaroids.cards?.[card.translation_key] ?? {
        title: card.slug,
        description: '',
    };
}

function roleplayCopy(card) {
    return sections.value.roleplay.cards?.[card.translation_key] ?? {
        title: card.slug,
        description: '',
    };
}

function luciferCopy(card) {
    return sections.value.lucifer.cards?.[card.translation_key] ?? {
        title: card.slug,
        description: '',
    };
}

function limitSectionCards(cards, desiredCount) {
    return cards.slice(0, Math.min(cards.length, desiredCount));
}

function timerSection(section) {
    return ['benandanti', 'polaroids'].includes(section) ? section : null;
}

function isTimerPaused(section) {
    const normalized = timerSection(section);

    return normalized ? timerPauseReasons[normalized].size > 0 : false;
}

function pauseSectionTimer(section, reason = 'hover') {
    const normalized = timerSection(section);

    if (!normalized) {
        return;
    }

    timerPauseReasons[normalized].add(reason);

    if (normalized === 'benandanti') {
        clearInterval(benandantiTimer);
        benandantiTimer = null;
    }

    if (normalized === 'polaroids') {
        stopPolaroidCarousel();
    }
}

function resumeSectionTimer(section, reason = 'hover') {
    const normalized = timerSection(section);

    if (!normalized) {
        return;
    }

    timerPauseReasons[normalized].delete(reason);

    if (isTimerPaused(normalized)) {
        return;
    }

    if (normalized === 'benandanti') {
        startBenandantiCarousel();
    }

    if (normalized === 'polaroids' && isPolaroidSectionVisible.value) {
        startPolaroidCarousel();
    }
}

function modalImage(src, alt = '', section = null) {
    return {
        src,
        alt,
        timerSection: timerSection(section),
    };
}

function openImageModal(payload) {
    if (!payload?.src) {
        return;
    }

    const section = timerSection(payload.timerSection);

    imageModal.value = {
        ...payload,
        timerSection: section,
    };

    if (section) {
        timerPauseReasons[section].delete('hover');
        timerPauseReasons[section].delete('focus');
    }
    pauseSectionTimer(section, 'modal');
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleModalKeydown);
}

function closeImageModal() {
    const section = imageModal.value?.timerSection;

    imageModal.value = null;
    document.body.style.overflow = '';
    window.removeEventListener('keydown', handleModalKeydown);
    resumeSectionTimer(section, 'modal');
}

function handleModalKeydown(event) {
    if (event.key === 'Escape') {
        closeImageModal();
    }
}

function updateImageTilt(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    event.currentTarget.style.setProperty('--tilt-x', `${((0.5 - y) * 12).toFixed(2)}deg`);
    event.currentTarget.style.setProperty('--tilt-y', `${((x - 0.5) * 12).toFixed(2)}deg`);
    event.currentTarget.style.setProperty('--glow-x', `${(x * 100).toFixed(1)}%`);
    event.currentTarget.style.setProperty('--glow-y', `${(y * 100).toFixed(1)}%`);
}

function resetImageTilt(event) {
    event.currentTarget.style.setProperty('--tilt-x', '0deg');
    event.currentTarget.style.setProperty('--tilt-y', '0deg');
}

function updateViewport() {
    const width = window.innerWidth;
    isMobile.value = width < 768;
    waveDistance.value = width * 1.55;
    waveDuration.value = `${Math.max(700, waveDistance.value / 2.5)}ms`;
}

function finishIntro() {
    sessionStorage.setItem(introKey, '1');
    introDone.value = true;
}

function startWave(direction) {
    if (!interactionsEnabled) {
        return;
    }

    if (direction === 'left' && currentState.value === 'left') {
        return;
    }
    if (direction === 'right' && currentState.value === 'right') {
        return;
    }
    if (direction === 'top' && currentState.value === 'top') {
        return;
    }
    if (direction === 'bottom' && currentState.value === 'bottom') {
        return;
    }

    wave.value[direction] = true;

    setTimeout(() => {
        wave.value.transition = true;
    }, 80);

    setTimeout(() => {
        currentState.value = direction === 'left' || direction === 'bottom' ? 'left' : 'right';
        wave.value = {
            left: false,
            right: false,
            top: false,
            bottom: false,
            transition: false,
        };
    }, 1000);
}

function initSectionAnimations() {
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.section-stage').forEach((section) => {
            section.classList.add('is-visible');
        });
        return;
    }

    sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add('is-visible');
                sectionObserver.unobserve(entry.target);
            });
        },
        {
            rootMargin: '-18% 0px -22% 0px',
            threshold: 0.12,
        },
    );

    document.querySelectorAll('.section-stage').forEach((section) => {
        sectionObserver.observe(section);
    });
}

function selectBenandante(index) {
    activeBenandanteIndex.value = index;
}

function advanceBenandante() {
    activeBenandanteIndex.value = (activeBenandanteIndex.value + 1) % benandanti.value.length;
}

function startBenandantiCarousel() {
    if (isTimerPaused('benandanti')) {
        return;
    }

    clearInterval(benandantiTimer);
    benandantiTimer = setInterval(advanceBenandante, 6200);
}

function advancePolaroidCarousel() {
    if (polaroidCards.value.length <= 4) {
        return;
    }

    polaroidStartIndex.value = (polaroidStartIndex.value + 1) % polaroidCards.value.length;
}

function startPolaroidCarousel() {
    if (polaroidTimer || polaroidCards.value.length <= 4 || isTimerPaused('polaroids')) {
        return;
    }

    polaroidTimer = setInterval(advancePolaroidCarousel, 12000);
}

function stopPolaroidCarousel() {
    clearInterval(polaroidTimer);
    polaroidTimer = null;
}

function initPolaroidViewport() {
    if (!polaroidSection.value) {
        return;
    }

    if (!('IntersectionObserver' in window)) {
        isPolaroidSectionVisible.value = true;
        startPolaroidCarousel();

        return;
    }

    polaroidObserver = new IntersectionObserver(
        ([entry]) => {
            isPolaroidSectionVisible.value = entry.isIntersecting;

            if (entry.isIntersecting) {
                startPolaroidCarousel();
            } else {
                stopPolaroidCarousel();
            }
        },
        {
            threshold: 0.28,
        },
    );

    polaroidObserver.observe(polaroidSection.value);
}

onMounted(() => {
    updateViewport();

    if (sessionStorage.getItem(introKey)) {
        introDone.value = true;
    } else {
        introTimeout = setTimeout(() => {
            introRevealed.value = true;
        }, 850);
    }

    window.addEventListener('resize', updateViewport);

    nextTick(() => {
        initSectionAnimations();
        initPolaroidViewport();
    });

    startBenandantiCarousel();
});

onBeforeUnmount(() => {
    clearTimeout(introTimeout);
    clearInterval(benandantiTimer);
    stopPolaroidCarousel();
    document.body.style.overflow = '';
    window.removeEventListener('keydown', handleModalKeydown);
    window.removeEventListener('resize', updateViewport);
    sectionObserver?.disconnect();
    polaroidObserver?.disconnect();
});
</script>

<template>
    <PublicLayout no-page-offset>
        <Head :title="copy.title" />
        <main class="relative min-h-screen w-full overflow-x-hidden bg-black text-white">
            <section v-if="!introDone" class="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black">
                <div
                    class="intro-star intro-star-shadow"
                    :class="{ 'intro-star-visible': introRevealed }"
                    aria-hidden="true"
                />
                <div
                    class="intro-star"
                    :class="{ 'intro-star-visible': introRevealed }"
                    @transitionend="finishIntro"
                    aria-hidden="true"
                />

                <video
                    class="relative z-10 w-[min(450px,76vw)] select-none"
                    :poster="logoPoster"
                    autoplay
                    muted
                    loop
                    playsinline
                    preload="auto"
                    :aria-label="copy.hero.brand"
                >
                    <source :src="logoVideo" type="video/webm" />
                    <img :src="logoPoster" :alt="copy.hero.brand" />
                </video>
            </section>

            <section
                v-show="introDone"
                class="relative h-screen w-full overflow-hidden transition-colors duration-500"
                :class="currentState === 'left' ? 'bg-[#5bc6d8]' : 'bg-[#ff547e]'"
            >
                <div class="absolute inset-0 z-10 flex flex-col justify-between overflow-hidden md:flex-row">
                    <button
                        class="hidden h-full w-2/5 cursor-default md:block"
                        type="button"
                        :aria-label="copy.hero.showFanArt"
                        :disabled="!interactionsEnabled"
                        @mouseenter="startWave('right')"
                        @focus="startWave('right')"
                    />
                    <button
                        class="hidden h-full w-2/5 cursor-default md:block"
                        type="button"
                        :aria-label="copy.hero.showOriginalArt"
                        :disabled="!interactionsEnabled"
                        @mouseenter="startWave('left')"
                        @focus="startWave('left')"
                    />
                    <button
                        class="block h-2/5 w-full cursor-default md:hidden"
                        type="button"
                        :aria-label="copy.hero.showFanArt"
                        :disabled="!interactionsEnabled"
                        @touchstart="startWave('right')"
                    />
                    <button
                        class="block h-2/5 w-full cursor-default md:hidden"
                        type="button"
                        :aria-label="copy.hero.showOriginalArt"
                        :disabled="!interactionsEnabled"
                        @touchstart="startWave('left')"
                    />
                </div>

                <div
                    v-if="!isMobile && wave.right"
                    class="absolute left-[-230%] top-0 z-20 h-full origin-left scale-x-[230%] transition-transform"
                    :class="wave.transition ? 'translate-x-[230%]' : 'translate-x-0'"
                    :style="{ transitionDuration: waveDuration }"
                >
                    <img :src="redWave" alt="" class="h-full" :style="{ maxWidth: waveDistance + 'px' }" />
                </div>

                <div
                    v-if="!isMobile && wave.left"
                    class="absolute right-[-230%] top-0 z-20 h-full origin-right scale-x-[230%] transition-transform"
                    :class="wave.transition ? 'translate-x-[-230%]' : 'translate-x-0'"
                    :style="{ transitionDuration: waveDuration }"
                >
                    <img :src="cyanWave" alt="" class="h-full" :style="{ maxWidth: waveDistance + 'px' }" />
                </div>

                <div
                    v-if="isMobile && wave.right"
                    class="absolute left-0 top-[-230%] z-20 w-full origin-top scale-y-[230%] transition-transform"
                    :style="{
                        transform: wave.transition ? 'translateY(230%)' : 'translateY(0)',
                        transitionDuration: waveDuration,
                    }"
                >
                    <img :src="redWave" alt="" class="w-full" :style="{ maxHeight: waveDistance + 'px' }" />
                </div>

                <div
                    v-if="isMobile && wave.left"
                    class="absolute bottom-[-230%] left-0 z-20 w-full origin-bottom scale-y-[230%] transition-transform"
                    :style="{
                        transform: wave.transition ? 'translateY(-230%)' : 'translateY(0)',
                        transitionDuration: waveDuration,
                    }"
                >
                    <img :src="cyanWave" alt="" class="w-full" :style="{ maxHeight: waveDistance + 'px' }" />
                </div>

                <div class="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
                    <video
                        class="w-[min(450px,72vw)] select-none drop-shadow-2xl"
                        :poster="logoPoster"
                        autoplay
                        muted
                        loop
                        playsinline
                        preload="auto"
                        :aria-label="copy.hero.brand"
                    >
                        <source :src="logoVideo" type="video/webm" />
                        <img :src="logoPoster" :alt="copy.hero.brand" />
                    </video>
                </div>

                <div class="pointer-events-none absolute inset-0 top-[56px] z-30 flex flex-col items-center justify-between px-4 pb-8 md:top-36 md:flex-row md:items-start md:px-8 md:pb-0">
                    <div class="pointer-events-auto flex w-[28%] cursor-default flex-col items-center gap-2 animate-slide-in-left md:w-1/4 xl:w-1/3">
                        <Link
                            :href="route('art.og')"
                            aria-disabled="true"
                            tabindex="-1"
                            class="image-tilt-surface flex cursor-zoom-in flex-col items-center gap-1"
                            @click.prevent="openImageModal(modalImage(originalImage, copy.hero.original))"
                            @pointermove="updateImageTilt"
                            @pointerleave="resetImageTilt"
                        >
                            <img :src="originalImage" :alt="copy.hero.original" class="image-tilt-media h-auto w-full drop-shadow-lg" />
                            <span class="text-xs font-bold uppercase tracking-widest text-white/0 drop-shadow-md">{{ copy.hero.original }}</span>
                        </Link>
                    </div>

                    <div class="hidden flex-1 md:block" />

                    <div class="pointer-events-auto flex w-[28%] cursor-default flex-col items-center gap-2 animate-slide-in-right md:w-1/4 xl:w-1/3">
                        <Link
                            :href="route('art.fa')"
                            aria-disabled="true"
                            tabindex="-1"
                            class="image-tilt-surface flex cursor-zoom-in flex-col items-center gap-1"
                            @click.prevent="openImageModal(modalImage(fanArtImage, copy.hero.fanArt))"
                            @pointermove="updateImageTilt"
                            @pointerleave="resetImageTilt"
                        >
                            <img :src="fanArtImage" :alt="copy.hero.fanArt" class="image-tilt-media h-auto w-full drop-shadow-lg" />
                            <span class="text-xs font-bold uppercase tracking-widest text-white/0 drop-shadow-md">{{ copy.hero.fanArt }}</span>
                        </Link>
                    </div>
                </div>

                <div class="pointer-events-none absolute bottom-6 left-0 right-0 z-30 flex justify-between px-6 md:hidden">
                    <span class="w-[28%] text-center text-[10px] font-bold uppercase tracking-widest text-white/80 drop-shadow">{{ copy.hero.original }}</span>
                    <span class="w-[28%] text-center text-[10px] font-bold uppercase tracking-widest text-white/80 drop-shadow">{{ copy.hero.fanArt }}</span>
                </div>
            </section>

            <section class="project-section section-stage solcatempo-dawn overflow-hidden text-[#f6fbff]">
                <div class="absolute inset-0 opacity-30 [background-image:linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.14)_1px,transparent_1px)] [background-size:52px_52px]" />
                <div class="constellation-field" aria-hidden="true">
                    <span class="constellation constellation-a" />
                    <span class="constellation constellation-b" />
                    <span class="constellation constellation-c" />
                </div>

                <div class="project-shell relative z-10 grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
                    <div>
                        <p class="section-kicker text-white/70">{{ sections.solcatempoDawn.kicker }}</p>
                        
                        <div class="solcatempo-mark mt-8">
                            <span class="solcatempo-s">S</span>
                            <span class="solcatempo-word">olca</span>
                            <span class="solcatempo-word block pl-16 sm:pl-28">Tempo</span>
                            <span class="solcatempo-blade" />
                            <span class="solcatempo-leaf" />
                        </div>
                    </div>
                    <div class="rounded-[2rem] border border-white/30 bg-[#142c76]/28 p-5 shadow-2xl backdrop-blur md:p-8">
                        <p class="max-w-xl text-xl font-semibold leading-relaxed md:text-3xl">
                            {{ sections.solcatempoDawn.body }}
                        </p>
                        <div class="mt-8 h-3 rounded-full bg-gradient-to-r from-[#ef7b2d] via-[#55c6d6] to-[#1f336f]" />
                    </div>
                </div>
            </section>

            <section class="project-section section-stage bg-[#f5f0e8] text-[#183466]">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(247,169,55,.35),transparent_28%),radial-gradient(circle_at_75%_25%,rgba(71,168,185,.25),transparent_24%)]" />
                <div class="project-shell relative z-10 flex flex-col items-center justify-center text-center">
                    <p class="section-kicker text-[#183466]/60">{{ sections.vestara.kicker }}</p>
                    <div class="vestara-card mt-8 w-full max-w-5xl rounded-[2.5rem] border-[10px] border-white bg-[#fbf7ef] px-6 py-12 shadow-[0_30px_90px_rgba(24,52,102,.22)] md:px-16">
                        <div class="mx-auto max-w-4xl">
                            <div class="text-[clamp(3.4rem,14vw,10rem)] font-black leading-[.78] text-[#f28a2e] drop-shadow-[0_8px_0_#20356c]">S</div>
                            <h2 class="mt-2 text-[clamp(2.4rem,8vw,7rem)] font-black uppercase leading-none tracking-normal text-[#17305f]">Solcatempo</h2>
                            <p class="mt-4 font-serif text-[clamp(2rem,5vw,4.5rem)] font-bold text-[#244577]">{{ sections.vestara.subtitle }}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="project-section section-stage bg-[#07110b] text-[#f4f0dd]">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(61,107,67,.45),transparent_28%),radial-gradient(circle_at_80%_25%,rgba(178,140,68,.2),transparent_26%),linear-gradient(180deg,#07110b,#020403)]" />
                <div class="project-shell relative z-10">
                    <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p class="section-kicker text-[#b8c8a4]">{{ sections.benandanti.kicker }}</p>
                            <h2 class="benandanti-logo mt-4">{{ sections.benandanti.title }}</h2>
                        </div>
                        <p class="max-w-xl text-lg leading-8 text-[#d6dec8]">{{ sections.benandanti.body }}</p>
                    </div>
                    <div class="benandanti-carousel mt-12">
                        <div class="benandanti-spotlight" :key="activeBenandante.name">
                            <button
                                type="button"
                                class="benandanti-portrait image-tilt-surface"
                                @click="openImageModal(modalImage(activeBenandante.image, activeBenandante.name, 'benandanti'))"
                                @pointerenter="pauseSectionTimer('benandanti')"
                                @pointermove="updateImageTilt"
                                @pointerleave="(event) => { resetImageTilt(event); resumeSectionTimer('benandanti'); }"
                                @focus="pauseSectionTimer('benandanti', 'focus')"
                                @blur="resumeSectionTimer('benandanti', 'focus')"
                            >
                                <img :src="activeBenandante.image" :alt="activeBenandante.name" class="image-tilt-media" />
                                <div class="chakra-orb" />
                            </button>
                            <div class="benandanti-copy">
                                <p class="text-sm font-black uppercase tracking-[0.24em] text-[#d6c57f]">{{ activeBenandante.chakra }}</p>
                                <h3>{{ activeBenandante.name }}</h3>
                                <p>{{ activeBenandante.full }}</p>
                            </div>
                        </div>

                        <div class="benandanti-track" :aria-label="sections.benandanti.trackLabel">
                            <button
                                v-for="(item, index) in benandanti"
                                :key="item.name"
                                type="button"
                                class="benandanti-thumb"
                                :class="{ 'is-active': index === activeBenandanteIndex }"
                                @click="selectBenandante(index); startBenandantiCarousel()"
                            >
                                <img
                                    :src="item.image"
                                    :alt="item.name"
                                    class="image-tilt-media cursor-zoom-in"
                                    @click.stop="openImageModal(modalImage(item.image, item.name, 'benandanti'))"
                                    @pointerenter.stop="pauseSectionTimer('benandanti')"
                                    @pointermove.stop="updateImageTilt"
                                    @pointerleave.stop="(event) => { resetImageTilt(event); resumeSectionTimer('benandanti'); }"
                                />
                                <span>{{ item.name }}</span>
                                <small>{{ item.short }}</small>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section ref="polaroidSection" class="project-section section-stage bg-[#f6ecd9] text-[#36251d]">
                <div class="project-shell relative z-10">
                    <div class="mx-auto max-w-4xl text-center">
                        <p class="section-kicker text-[#8a6751]">{{ sections.polaroids.kicker }}</p>
                        <h2 class="mt-4 text-[clamp(3rem,9vw,8rem)] font-black leading-none">{{ sections.polaroids.title }}</h2>
                        <p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#6d4b38]">{{ sections.polaroids.lead }}</p>
                    </div>
                    <TransitionGroup
                        name="polaroid-shift"
                        tag="div"
                        class="polaroid-carousel mt-14"
                        :class="{ 'is-running': isPolaroidSectionVisible }"
                    >
                        <article
                            v-for="(card, index) in visiblePolaroidCards"
                            :key="card.slug"
                            class="travel-polaroid"
                            :class="{ 'is-chromatic': card.isChromatic }"
                            :style="{ '--tilt': `${index % 2 ? 2.2 : -2.2}deg`, '--delay': `${index * 90}ms` }"
                        >
                            <button
                                type="button"
                                class="travel-polaroid-visual image-tilt-surface"
                                @click="openImageModal(modalImage(card.image_path, polaroidCopy(card).title, 'polaroids'))"
                                @pointerenter="pauseSectionTimer('polaroids')"
                                @pointermove="updateImageTilt"
                                @pointerleave="(event) => { resetImageTilt(event); resumeSectionTimer('polaroids'); }"
                                @focus="pauseSectionTimer('polaroids', 'focus')"
                                @blur="resumeSectionTimer('polaroids', 'focus')"
                            >
                                <img :src="card.image_path" :alt="polaroidCopy(card).title" loading="lazy" class="image-tilt-media" />
                                <!-- TODO: enhance chromatic experience -->
                                <div v-if="card.isChromatic" class="chromatic-overlay" aria-hidden="true">
                                    <span>{{ sections.polaroids.chromaticBadge }}</span>
                                </div>
                            </button>
                            <div class="travel-polaroid-copy">
                                <h3>{{ polaroidCopy(card).title }}</h3>
                                <p>{{ polaroidCopy(card).description }}</p>
                            </div>
                        </article>
                    </TransitionGroup>
                </div>
            </section>

            <section class="project-section section-stage bg-[#26113f] text-white">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(250,204,21,.45),transparent_18%),radial-gradient(circle_at_88%_25%,rgba(236,72,153,.36),transparent_22%),linear-gradient(145deg,#26113f,#6d28d9_48%,#f9a8d4)]" />
                <div class="project-shell relative z-10">
                    <div class="flex flex-wrap items-center justify-between gap-8">
                        <div>
                            <p class="section-kicker text-white/70">{{ sections.magicalGirls.kicker }}</p>
                            <h2 class="magic-title mt-4">{{ sections.magicalGirls.title }}</h2>
                        </div>
                        <div class="magic-tools" aria-hidden="true">
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>
                    <div class="mt-16 grid gap-6 md:grid-cols-2">
                        <article v-for="(item, index) in sections.magicalGirls.items" :key="item[0]" class="magic-card motion-safe:animate-float-in" :style="{ animationDelay: `${index * 90}ms` }">
                            <HomeImageFrame
                                :image="homeCardImage('magicalGirls', index)"
                                :gradient-class="gradients.magicalGirls[index]"
                                frame-class="h-56 rounded-[1.5rem]"
                                @open-image="openImageModal"
                                @pause-timer="pauseSectionTimer"
                                @resume-timer="resumeSectionTimer"
                            />
                            <div>
                                <h3 class="text-3xl font-black">{{ item[0] }}</h3>
                                <p class="mt-3 leading-7 text-white/78">{{ item[1] }}</p>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            <section class="project-section section-stage bg-[#120f0b] text-[#f5ead9]">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(180,83,9,.28),transparent_22%),radial-gradient(circle_at_82%_12%,rgba(45,212,191,.16),transparent_20%),radial-gradient(circle_at_70%_88%,rgba(147,51,234,.18),transparent_24%),linear-gradient(145deg,#120f0b,#23140e_45%,#111827)]" />
                <div class="dragon-grid-lines absolute inset-0" aria-hidden="true" />
                <div class="project-shell relative z-10">
                    <div class="dragon-header">
                        <div>
                            <p class="section-kicker text-[#d1a56f]">{{ sections.roleplay.kicker }}</p>
                            <h2 class="dragon-title mt-4">{{ sections.roleplay.title }}</h2>
                        </div>
                        <p>{{ sections.roleplay.body }}</p>
                    </div>
                    <div class="weapon-rule mt-8" />
                    <div class="dragon-gallery mt-12">
                        <article
                            v-for="(card, index) in roleplayCards"
                            :key="card.slug"
                            class="dragon-card motion-safe:animate-rise-in"
                            :style="{ '--dragon-delay': `${index * 120}ms`, '--dragon-tilt': `${index % 2 ? 1.5 : -1.5}deg` }"
                        >
                            <button
                                type="button"
                                class="dragon-frame image-tilt-surface"
                                @click="openImageModal(modalImage(card.image_path, roleplayCopy(card).title))"
                                @pointermove="updateImageTilt"
                                @pointerleave="resetImageTilt"
                            >
                                <img :src="card.image_path" :alt="roleplayCopy(card).title" loading="lazy" class="image-tilt-media" />
                            </button>
                            <div class="dragon-copy">
                                <span>{{ String(index + 1).padStart(2, '0') }}</span>
                                <h3>{{ roleplayCopy(card).title }}</h3>
                                <p>{{ roleplayCopy(card).description }}</p>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            <section class="project-section section-stage bg-[#050505] text-[#e7dfd8]">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_70%,rgba(127,29,29,.5),transparent_28%),linear-gradient(180deg,#050505,#171717_45%,#2b0707)]" />
                <div class="absolute inset-x-0 top-0 h-24 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,.08)_0_1px,transparent_1px_12px)] opacity-40" />
                <div class="project-shell relative z-10">
                    <div class="lucifer-header">
                        <p class="section-kicker text-[#b45309]">{{ sections.lucifer.kicker }}</p>
                        <h2>{{ sections.lucifer.title }}</h2>
                        <p>{{ sections.lucifer.body }}</p>
                    </div>
                    <div class="lucifer-gallery mt-12" :class="{ 'is-single': luciferCards.length === 1 }">
                        <article
                            v-for="(card, index) in luciferCards"
                            :key="card.slug"
                            class="lucifer-card motion-safe:animate-rise-in"
                            :style="{ animationDelay: `${index * 120}ms` }"
                        >
                            <button
                                type="button"
                                class="lucifer-frame image-tilt-surface"
                                @click="openImageModal(modalImage(card.image_path, luciferCopy(card).title))"
                                @pointermove="updateImageTilt"
                                @pointerleave="resetImageTilt"
                            >
                                <img :src="card.image_path" :alt="luciferCopy(card).title" loading="lazy" class="image-tilt-media" />
                            </button>
                            <div class="lucifer-copy">
                                <span>{{ String(index + 1).padStart(2, '0') }}</span>
                                <h3>{{ luciferCopy(card).title }}</h3>
                                <p>{{ luciferCopy(card).description }}</p>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            <section class="project-section section-stage bg-[#fff3c7] text-[#5c2f2b]">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(244,114,182,.42),transparent_20%),radial-gradient(circle_at_85%_18%,rgba(45,212,191,.32),transparent_24%),linear-gradient(140deg,#fff3c7,#ffc4d6_52%,#a7f3d0)]" />
                <div class="project-shell relative z-10">
                    <div class="text-center">
                        <p class="section-kicker text-[#8f4f45]">{{ sections.pamsticceria.kicker }}</p>
                        <h2 class="mt-4 text-[clamp(3rem,9vw,8rem)] font-black leading-none">{{ sections.pamsticceria.title }}</h2>
                    </div>
                    <div class="mt-12 flex snap-x gap-5 overflow-x-auto px-[8vw] pb-8 md:px-0">
                        <article v-for="(item, index) in sections.pamsticceria.items" :key="item[0]" class="sweet-card" :style="{ transform: `rotate(${index % 2 ? 3 : -3}deg)` }">
                            <HomeImageFrame
                                :image="homeCardImage('pamsticceria', index)"
                                :gradient-class="gradients.pamsticceria[index]"
                                frame-class="h-64 rounded-[2rem]"
                                @open-image="openImageModal"
                                @pause-timer="pauseSectionTimer"
                                @resume-timer="resumeSectionTimer"
                            />
                            <h3 class="mt-5 text-3xl font-black">{{ item[0] }}</h3>
                            <p class="mt-3 leading-7 text-[#6d4038]">{{ item[1] }}</p>
                        </article>
                    </div>
                </div>
            </section>

            <section class="project-section section-stage bg-[#e8edf2] text-[#151a22]">
                <div class="project-shell relative z-10">
                    <div class="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
                        <div>
                            <p class="section-kicker text-[#667085]">{{ sections.characterLab.kicker }}</p>
                            <h2 class="mt-4 text-[clamp(3rem,8vw,7rem)] font-black uppercase leading-none">{{ sections.characterLab.title }}</h2>
                            <p class="mt-6 text-xl leading-8 text-[#475467]">{{ sections.characterLab.body }}</p>
                        </div>
                        <div class="grid gap-4 sm:grid-cols-2">
                            <article v-for="(item, index) in sections.characterLab.items" :key="item[0]" class="lab-card motion-safe:animate-float-in" :style="{ animationDelay: `${index * 90}ms` }">
                                <HomeImageFrame
                                    :image="homeCardImage('characterLab', index)"
                                    :gradient-class="gradients.characterLab[index]"
                                    frame-class="h-44 rounded-2xl"
                                    @open-image="openImageModal"
                                    @pause-timer="pauseSectionTimer"
                                    @resume-timer="resumeSectionTimer"
                                />
                                <h3 class="mt-5 text-2xl font-black">{{ item[0] }}</h3>
                                <p class="mt-2 leading-7 text-[#475467]">{{ item[1] }}</p>
                            </article>
                        </div>
                    </div>
                </div>
            </section>

            <section class="project-section section-stage bg-[#111827] text-white">
                <div class="project-shell relative z-10 grid gap-10 lg:grid-cols-2 lg:items-center">
                    <div>
                        <p class="section-kicker text-white/55">{{ sections.oc.kicker }}</p>
                        <h2 class="mt-4 text-[clamp(4rem,10vw,9rem)] font-black uppercase leading-none">{{ sections.oc.title }}</h2>
                        <p class="mt-6 max-w-xl text-xl leading-8 text-white/68">{{ sections.oc.body }}</p>
                    </div>
                    <div class="grid gap-5 sm:grid-cols-2">
                        <article v-for="(item, index) in sections.oc.items" :key="item[0]" class="mirror-card mirror-card-dark motion-safe:animate-rise-in" :style="{ animationDelay: `${index * 100}ms` }">
                            <HomeImageFrame
                                :image="homeCardImage('oc', index)"
                                :gradient-class="gradients.oc[index]"
                                frame-class="h-52 rounded-[1.25rem]"
                                @open-image="openImageModal"
                                @pause-timer="pauseSectionTimer"
                                @resume-timer="resumeSectionTimer"
                            />
                            <h3 class="mt-5 text-2xl font-black">{{ item[0] }}</h3>
                            <p class="mt-3 leading-7 text-white/64">{{ item[1] }}</p>
                        </article>
                    </div>
                </div>
            </section>

            <section class="project-section section-stage bg-[#f7f4ef] text-[#111827]">
                <div class="project-shell relative z-10 grid gap-10 lg:grid-cols-2 lg:items-center">
                    <div class="order-2 grid gap-5 sm:grid-cols-2 lg:order-1">
                        <article v-for="(item, index) in sections.fanart.items" :key="item[0]" class="mirror-card motion-safe:animate-rise-in" :style="{ animationDelay: `${index * 100}ms` }">
                            <HomeImageFrame
                                :image="homeCardImage('fanart', index)"
                                :gradient-class="gradients.fanart[index]"
                                frame-class="h-52 rounded-[1.25rem]"
                                @open-image="openImageModal"
                                @pause-timer="pauseSectionTimer"
                                @resume-timer="resumeSectionTimer"
                            />
                            <h3 class="mt-5 text-2xl font-black">{{ item[0] }}</h3>
                            <p class="mt-3 leading-7 text-[#4b5563]">{{ item[1] }}</p>
                        </article>
                    </div>
                    <div class="order-1 text-right lg:order-2">
                        <p class="section-kicker text-[#6b7280]">{{ sections.fanart.kicker }}</p>
                        <h2 class="mt-4 text-[clamp(4rem,10vw,9rem)] font-black uppercase leading-none">{{ sections.fanart.title }}</h2>
                        <p class="ml-auto mt-6 max-w-xl text-xl leading-8 text-[#4b5563]">{{ sections.fanart.body }}</p>
                    </div>
                </div>
            </section>

            <Teleport to="body">
                <Transition name="image-modal">
                    <div
                        v-if="imageModal"
                        class="image-modal"
                        role="dialog"
                        aria-modal="true"
                        :aria-label="imageModal.alt"
                        tabindex="0"
                        @click.self="closeImageModal"
                        @keyup.escape="closeImageModal"
                    >
                        <button type="button" class="image-modal-close" aria-label="Chiudi immagine" @click="closeImageModal">
                            ×
                        </button>
                        <div class="image-modal-frame" @click="closeImageModal">
                            <img :src="imageModal.src" :alt="imageModal.alt" @click.stop />
                        </div>
                    </div>
                </Transition>
            </Teleport>
        </main>
    </PublicLayout>
</template>

<style scoped>
@keyframes slideInLeft {
    0% {
        transform: translate(-150%, -20%) scale(0.95);
        opacity: 0.25;
    }
    60% {
        transform: translate(10%, 10%) scale(1.02);
        opacity: 0.7;
    }
    100% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
    }
}

@keyframes slideInRight {
    0% {
        transform: translate(150%, -20%) scale(0.95);
        opacity: 0.25;
    }
    60% {
        transform: translate(-10%, 10%) scale(1.02);
        opacity: 0.7;
    }
    100% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
    }
}

@keyframes floatIn {
    from {
        transform: translateY(40px) scale(0.98);
        opacity: 0;
    }
    to {
        transform: translateY(0) scale(1);
        opacity: 1;
    }
}

@keyframes riseIn {
    from {
        transform: translateY(64px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes sectionSheen {
    0% {
        opacity: 0;
        translate: -120% 0;
    }
    22% {
        opacity: 0.8;
    }
    100% {
        opacity: 0;
        translate: 120% 0;
    }
}

@keyframes chakraPulse {
    0%,
    100% {
        box-shadow: inset 0 0 35px rgba(255, 255, 255, 0.25), 0 0 45px rgba(236, 220, 150, 0.38);
    }
    50% {
        box-shadow: inset 0 0 42px rgba(255, 255, 255, 0.38), 0 0 68px rgba(236, 220, 150, 0.62);
    }
}

@keyframes toolDrift {
    0%,
    100% {
        translate: 0 0;
    }
    50% {
        translate: 0 -10px;
    }
}

@keyframes softBob {
    0%,
    100% {
        translate: 0 0;
    }
    50% {
        translate: 0 -8px;
    }
}

@keyframes visualBreath {
    0%,
    100% {
        scale: 1;
    }
    50% {
        scale: 1.025;
    }
}

@keyframes chromaticSweep {
    0% {
        transform: translateX(-130%) rotate(14deg);
    }
    100% {
        transform: translateX(130%) rotate(14deg);
    }
}

@keyframes chromaticPulse {
    0%,
    100% {
        opacity: 0.72;
        filter: saturate(1.15);
    }
    50% {
        opacity: 1;
        filter: saturate(1.35);
    }
}

.animate-slide-in-left {
    animation: slideInLeft 2s cubic-bezier(0.77, 0, 0.175, 1) forwards;
}

.animate-slide-in-right {
    animation: slideInRight 2s cubic-bezier(0.77, 0, 0.175, 1) forwards;
}

.intro-star {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 240vmax;
    height: 240vmax;
    background: #ff547e;
    clip-path: polygon(50% 0%, 61% 32%, 95% 14%, 76% 47%, 100% 70%, 66% 72%, 72% 100%, 50% 82%, 28% 100%, 34% 72%, 0% 70%, 24% 47%, 5% 14%, 39% 32%);
    transform: translate(-50%, -50%) scale(0) rotate(-18deg);
    transform-origin: center;
    transition: transform 2000ms cubic-bezier(0.16, 1, 0.3, 1);
}

.intro-star-shadow {
    background: #ffd36f;
    filter: drop-shadow(0 0 22px rgba(255, 211, 111, 0.55));
    transform: translate(-50%, -50%) scale(0) rotate(8deg);
    transition-delay: 70ms;
}

.intro-star-visible {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
}

.project-section {
    position: relative;
    min-height: 100vh;
    isolation: isolate;
}

.section-stage {
    overflow: hidden;
}

.section-stage::after {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    content: '';
    background: linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.28) 46%, transparent 58%);
    opacity: 0;
    translate: -120% 0;
}

.section-stage.is-visible::after {
    animation: sectionSheen 1150ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.project-shell {
    width: min(1180px, calc(100% - 32px));
    min-height: 100vh;
    margin: 0 auto;
    padding: clamp(96px, 11vw, 150px) 0;
}

.image-tilt-surface {
    position: relative;
    border: 0;
    color: inherit;
    cursor: zoom-in;
    perspective: 900px;
    transform-style: preserve-3d;
}

.image-tilt-media {
    transform: rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) translateZ(0);
    transition:
        transform 180ms ease,
        filter 180ms ease;
    will-change: transform;
}

.image-tilt-surface:hover .image-tilt-media,
.image-tilt-surface:focus-visible .image-tilt-media,
.image-tilt-media:hover {
    filter: saturate(1.08) contrast(1.03);
}

.image-tilt-surface::after {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: '';
    background: radial-gradient(circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(255, 255, 255, 0.26), transparent 34%);
    opacity: 0;
    transition: opacity 180ms ease;
    mix-blend-mode: screen;
}

.image-tilt-surface:hover::after,
.image-tilt-surface:focus-visible::after {
    opacity: 1;
}

.image-modal {
    position: fixed;
    inset: 0;
    z-index: 120;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    padding: clamp(0.75rem, 3vw, 2.5rem);
    overflow: hidden;
    background:
        radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.12), transparent 28%),
        rgba(3, 5, 10, 0.92);
    backdrop-filter: blur(18px);
}

.image-modal-frame {
    display: flex;
    align-items: center;
    justify-content: center;
    width: min(100%, 1500px);
    max-width: 100%;
    height: calc(100dvh - clamp(1.5rem, 6vw, 5rem));
    max-height: calc(100dvh - clamp(1.5rem, 6vw, 5rem));
    overflow: hidden;
}

.image-modal-frame img {
    display: block;
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 30px 80px rgba(0, 0, 0, 0.55));
}

.image-modal-close {
    position: fixed;
    right: clamp(1rem, 3vw, 2rem);
    top: clamp(1rem, 3vw, 2rem);
    z-index: 2;
    display: grid;
    width: 44px;
    height: 44px;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, 0.28);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 2rem;
    line-height: 1;
    backdrop-filter: blur(14px);
}

.image-modal-enter-active,
.image-modal-leave-active {
    transition:
        opacity 260ms ease,
        backdrop-filter 260ms ease;
}

.image-modal-enter-from,
.image-modal-leave-to {
    opacity: 0;
    backdrop-filter: blur(0);
}

.section-kicker {
    font-size: 0.75rem;
    font-weight: 900;
    letter-spacing: 0.18em;
    text-transform: uppercase;
}

.solcatempo-dawn {
    background:
        radial-gradient(circle at 18% 18%, rgba(123, 210, 228, 0.46) 0, transparent 24%),
        radial-gradient(circle at 82% 28%, rgba(236, 82, 166, 0.34) 0, transparent 23%),
        linear-gradient(0deg, #f58232 0%, #e95075 12%, #7d63c9 28%, #273f9d 52%, #112369 78%, #07113f 100%);
}

.solcatempo-dawn::before {
    position: absolute;
    inset: auto -10% 0;
    height: 46%;
    pointer-events: none;
    content: '';
    background:
        radial-gradient(ellipse at 50% 100%, rgba(255, 198, 91, 0.9) 0, rgba(255, 129, 62, 0.54) 32%, transparent 68%),
        linear-gradient(0deg, rgba(255, 238, 184, 0.42), transparent 72%);
    filter: blur(2px);
    opacity: 0.95;
}

.constellation-field {
    position: absolute;
    inset: 6% 0 auto;
    z-index: 1;
    height: 34%;
    pointer-events: none;
    opacity: 0.52;
}

.constellation {
    position: absolute;
    width: clamp(150px, 20vw, 280px);
    aspect-ratio: 1.55;
    background:
        radial-gradient(circle at 10% 58%, rgba(255, 255, 255, 0.95) 0 2px, transparent 3px),
        radial-gradient(circle at 28% 36%, rgba(255, 255, 255, 0.88) 0 2px, transparent 3px),
        radial-gradient(circle at 48% 50%, rgba(255, 255, 255, 0.9) 0 2px, transparent 3px),
        radial-gradient(circle at 68% 22%, rgba(255, 255, 255, 0.82) 0 2px, transparent 3px),
        radial-gradient(circle at 86% 62%, rgba(255, 255, 255, 0.95) 0 2px, transparent 3px),
        linear-gradient(18deg, transparent 9%, rgba(255, 255, 255, 0.22) 9.5% 10.2%, transparent 10.6%),
        linear-gradient(-12deg, transparent 28%, rgba(255, 255, 255, 0.2) 28.5% 29.2%, transparent 29.7%),
        linear-gradient(22deg, transparent 47%, rgba(255, 255, 255, 0.2) 47.5% 48.2%, transparent 48.7%),
        linear-gradient(-20deg, transparent 67%, rgba(255, 255, 255, 0.18) 67.5% 68.1%, transparent 68.6%);
    filter: drop-shadow(0 0 10px rgba(154, 217, 255, 0.45));
}

.constellation-a {
    left: 8%;
    top: 8%;
    rotate: -8deg;
}

.constellation-b {
    left: 43%;
    top: 2%;
    scale: 0.8;
    rotate: 13deg;
}

.constellation-c {
    right: 7%;
    top: 18%;
    scale: 0.66;
    rotate: -22deg;
}

.section-stage :is(.section-kicker, h2, h3, p, article, .benandanti-spotlight, .benandanti-thumb, .solcatempo-mark, .solcatempo-s, .solcatempo-word, .solcatempo-blade, .solcatempo-leaf, .vestara-card, .chakra-orb, .travel-polaroid, .magic-tools, .magic-tools span, .weapon-rule, .magic-card, .dragon-card, .rpg-card, .lucifer-card, .sweet-card, .lab-card, .mirror-card) {
    opacity: 0;
    filter: blur(12px);
    scale: 0.97;
    translate: 0 42px;
    transition:
        opacity 780ms cubic-bezier(0.16, 1, 0.3, 1),
        filter 780ms cubic-bezier(0.16, 1, 0.3, 1),
        scale 780ms cubic-bezier(0.16, 1, 0.3, 1),
        translate 780ms cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: var(--reveal-delay, 0ms);
    will-change: opacity, filter, scale, translate;
}

.section-stage.is-visible :is(.section-kicker, h2, h3, p, article, .benandanti-spotlight, .benandanti-thumb, .solcatempo-mark, .solcatempo-s, .solcatempo-word, .solcatempo-blade, .solcatempo-leaf, .vestara-card, .chakra-orb, .travel-polaroid, .magic-tools, .magic-tools span, .weapon-rule, .magic-card, .dragon-card, .rpg-card, .lucifer-card, .sweet-card, .lab-card, .mirror-card) {
    opacity: 1;
    filter: blur(0);
    scale: 1;
    translate: 0 0;
}

.section-stage .section-kicker {
    --reveal-delay: 80ms;
    translate: 0 20px;
}

.section-stage :is(h2, .benandanti-logo, .magic-title, .solcatempo-mark) {
    --reveal-delay: 170ms;
    translate: 0 58px;
}

.section-stage :is(.vestara-card, .weapon-rule, .magic-tools) {
    --reveal-delay: 260ms;
}

.section-stage article:nth-child(1),
.section-stage .magic-tools span:nth-child(1),
.section-stage .solcatempo-s {
    --reveal-delay: 320ms;
}

.section-stage article:nth-child(2),
.section-stage .magic-tools span:nth-child(2),
.section-stage .solcatempo-word:nth-child(2) {
    --reveal-delay: 430ms;
}

.section-stage article:nth-child(3),
.section-stage .magic-tools span:nth-child(3),
.section-stage .solcatempo-word:nth-child(3) {
    --reveal-delay: 540ms;
}

.section-stage article:nth-child(4),
.section-stage .solcatempo-blade {
    --reveal-delay: 650ms;
}

.section-stage article:nth-child(5),
.section-stage .solcatempo-leaf {
    --reveal-delay: 760ms;
}

.section-stage article:nth-child(6) {
    --reveal-delay: 870ms;
}

.section-stage article:nth-child(7) {
    --reveal-delay: 980ms;
}

.section-stage .benandanti-thumb:nth-child(1) {
    --reveal-delay: 480ms;
}

.section-stage .benandanti-thumb:nth-child(2) {
    --reveal-delay: 560ms;
}

.section-stage .benandanti-thumb:nth-child(3) {
    --reveal-delay: 640ms;
}

.section-stage .benandanti-thumb:nth-child(4) {
    --reveal-delay: 720ms;
}

.section-stage .benandanti-thumb:nth-child(5) {
    --reveal-delay: 800ms;
}

.section-stage .benandanti-thumb:nth-child(6) {
    --reveal-delay: 880ms;
}

.section-stage .benandanti-thumb:nth-child(7) {
    --reveal-delay: 960ms;
}

.solcatempo-mark {
    position: relative;
    max-width: 820px;
    min-height: 340px;
    font-weight: 950;
    line-height: 0.78;
}

.solcatempo-s {
    color: #f28a2e;
    display: inline-block;
    font-size: clamp(8rem, 24vw, 18rem);
    text-shadow: 8px 10px 0 #21366e;
}

.solcatempo-word {
    color: #20356c;
    display: inline-block;
    font-size: clamp(3rem, 9vw, 8rem);
    margin-left: -0.18em;
    text-shadow: 0 5px 0 rgba(255, 255, 255, 0.55);
}

.solcatempo-blade {
    position: absolute;
    left: clamp(80px, 16vw, 180px);
    top: clamp(90px, 13vw, 145px);
    width: min(58vw, 520px);
    height: 22px;
    background: #193a74;
    border: 4px solid #10234d;
    clip-path: polygon(0 48%, 86% 0, 100% 50%, 86% 100%, 0 52%);
    transform: rotate(-4deg);
}

.solcatempo-leaf {
    position: absolute;
    left: clamp(10px, 2vw, 24px);
    top: clamp(160px, 19vw, 220px);
    width: 92px;
    height: 92px;
    background: #e9622d;
    clip-path: polygon(50% 0, 62% 35%, 100% 18%, 78% 52%, 100% 82%, 61% 68%, 50% 100%, 39% 68%, 0 82%, 22% 52%, 0 18%, 38% 35%);
}

.vestara-card {
    transform: rotate(-1deg);
}

.benandanti-logo {
    color: #f4f0dd;
    font-family: Georgia, serif;
    font-size: clamp(3.4rem, 10vw, 8.5rem);
    font-weight: 900;
    line-height: 0.9;
    text-shadow: 0 12px 0 rgba(9, 39, 20, 0.8), 0 0 30px rgba(151, 189, 121, 0.45);
}

.benandanti-carousel {
    display: grid;
    gap: 1.25rem;
}

.benandanti-spotlight {
    display: grid;
    gap: clamp(1.5rem, 4vw, 3.5rem);
    align-items: center;
    min-height: 520px;
    overflow: hidden;
    padding: clamp(1rem, 2.8vw, 2rem);
    border: 1px solid rgba(214, 197, 127, 0.24);
    border-radius: 2.5rem;
    background:
        radial-gradient(circle at 22% 22%, rgba(143, 191, 114, 0.15), transparent 28%),
        linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.035));
    box-shadow: 0 30px 100px rgba(0, 0, 0, 0.34);
    backdrop-filter: blur(18px);
}

.benandanti-portrait {
    position: relative;
    display: grid;
    min-height: min(62vh, 560px);
    place-items: center;
    overflow: hidden;
    width: 100%;
    padding: 0;
    border-radius: 2rem;
    background:
        radial-gradient(circle at 50% 45%, rgba(214, 197, 127, 0.14), transparent 34%),
        linear-gradient(180deg, rgba(10, 31, 19, 0.18), rgba(0, 0, 0, 0.3));
}

.benandanti-portrait img {
    position: relative;
    z-index: 2;
    max-width: min(92%, 520px);
    max-height: min(58vh, 540px);
    object-fit: contain;
    filter: drop-shadow(0 28px 42px rgba(0, 0, 0, 0.42));
}

.benandanti-copy h3 {
    max-width: 100%;
    margin-top: 0.65rem;
    font-family: Georgia, serif;
    font-size: clamp(2.7rem, 6vw, 5.8rem);
    font-weight: 900;
    line-height: 0.88;
    text-transform: uppercase;
    overflow-wrap: anywhere;
}

.benandanti-copy {
    min-width: 0;
}

.benandanti-copy > p:last-child {
    max-width: 650px;
    margin-top: 1.25rem;
    color: #d6dec8;
    font-size: clamp(1.05rem, 1.7vw, 1.35rem);
    line-height: 1.65;
}

.benandanti-track {
    display: flex;
    gap: 0.75rem;
    overflow-x: auto;
    padding: 0.25rem 0 0.8rem;
    scrollbar-width: none;
}

.benandanti-track::-webkit-scrollbar {
    display: none;
}

.benandanti-thumb {
    width: min(230px, 68vw);
    flex: 0 0 auto;
    text-align: left;
    padding: 0.75rem;
    border: 1px solid rgba(214, 197, 127, 0.12);
    border-radius: 1.25rem;
    background: rgba(255, 255, 255, 0.045);
    color: inherit;
    opacity: 0.58;
    transition:
        opacity 260ms ease,
        border-color 260ms ease,
        background-color 260ms ease,
        transform 260ms ease;
}

.benandanti-thumb:hover,
.benandanti-thumb:focus-visible,
.benandanti-thumb.is-active {
    opacity: 1;
    border-color: rgba(214, 197, 127, 0.5);
    background: rgba(214, 197, 127, 0.1);
    transform: translateY(-4px);
}

.benandanti-thumb img {
    width: 100%;
    height: 118px;
    object-fit: contain;
    border-radius: 0.9rem;
    background: rgba(255, 255, 255, 0.9);
}

.benandanti-thumb span {
    display: block;
    margin-top: 0.7rem;
    font-size: 0.9rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.benandanti-thumb small {
    display: block;
    margin-top: 0.3rem;
    color: rgba(214, 222, 200, 0.74);
    font-size: 0.78rem;
    line-height: 1.45;
}

.chakra-orb {
    position: absolute;
    inset: 50% auto auto 50%;
    z-index: 1;
    width: 116px;
    height: 116px;
    margin: -58px 0 0 -58px;
    border: 2px solid rgba(255, 255, 255, 0.55);
    border-radius: 999px;
    box-shadow: inset 0 0 35px rgba(255, 255, 255, 0.25), 0 0 45px rgba(236, 220, 150, 0.38);
}

.polaroid-carousel {
    position: relative;
    display: grid;
    gap: clamp(1.1rem, 2.2vw, 1.8rem);
    max-width: 1040px;
    margin-right: auto;
    margin-left: auto;
    padding: clamp(1rem, 3vw, 2.25rem);
    border: 1px solid rgba(111, 74, 46, 0.14);
    background:
        linear-gradient(90deg, rgba(120, 74, 42, 0.07) 1px, transparent 1px),
        linear-gradient(rgba(120, 74, 42, 0.07) 1px, transparent 1px),
        radial-gradient(circle at 14% 8%, rgba(239, 147, 84, 0.2), transparent 28%),
        radial-gradient(circle at 82% 94%, rgba(73, 143, 148, 0.16), transparent 26%),
        #fff8e9;
    background-size: 34px 34px, 34px 34px, 100% 100%, 100% 100%, 100% 100%;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.55), 0 26px 90px rgba(58, 35, 24, 0.14);
}

.polaroid-carousel::before {
    position: absolute;
    inset: 16px;
    z-index: -1;
    content: '';
    background: rgba(96, 57, 34, 0.15);
    filter: blur(30px);
    transform: rotate(-1deg);
}

.travel-polaroid {
    position: relative;
    display: grid;
    grid-template-columns: minmax(126px, clamp(146px, 22vw, 235px)) minmax(0, 1fr);
    gap: clamp(0.9rem, 2.4vw, 1.75rem);
    align-items: center;
    min-width: 0;
    padding: clamp(0.65rem, 1.6vw, 1rem);
    border: 1px solid rgba(91, 60, 42, 0.12);
    background: rgba(255, 252, 242, 0.66);
    box-shadow: 0 18px 46px rgba(61, 38, 25, 0.1);
    transform-origin: 50% 50%;
    transition:
        transform 420ms ease,
        filter 420ms ease,
        box-shadow 420ms ease;
    transition-delay: var(--delay);
}

.travel-polaroid:nth-child(even) {
    grid-template-columns: minmax(0, 1fr) minmax(126px, clamp(146px, 22vw, 235px));
}

.travel-polaroid:nth-child(even) .travel-polaroid-visual {
    order: 2;
}

.travel-polaroid:nth-child(even) .travel-polaroid-copy {
    order: 1;
    text-align: right;
}

.travel-polaroid-visual {
    position: relative;
    overflow: hidden;
    padding: 0;
    background: transparent;
    transform: rotate(var(--tilt));
    transition: transform 420ms ease;
}

.travel-polaroid-visual img {
    display: block;
    width: min(100%, 235px);
    max-height: clamp(205px, 36vh, 320px);
    margin: 0 auto;
    aspect-ratio: 0.84;
    object-fit: contain;
    filter: drop-shadow(0 22px 24px rgba(55, 33, 22, 0.22));
}

.travel-polaroid.is-chromatic {
    z-index: 1;
}

.travel-polaroid.is-chromatic .travel-polaroid-visual {
    border-radius: 0.4rem;
    filter: drop-shadow(0 22px 34px rgba(40, 112, 116, 0.28));
}

.travel-polaroid.is-chromatic .travel-polaroid-visual::before {
    position: absolute;
    inset: 2.5% 3.5%;
    z-index: 2;
    pointer-events: none;
    content: '';
    border: 1px solid rgba(255, 255, 255, 0.78);
    box-shadow:
        inset 0 0 22px rgba(255, 255, 255, 0.3),
        0 0 24px rgba(72, 211, 190, 0.38),
        0 0 42px rgba(255, 197, 87, 0.22);
    mix-blend-mode: screen;
}

.travel-polaroid.is-chromatic .travel-polaroid-visual::after {
    position: absolute;
    inset: -18% auto -18% -34%;
    z-index: 3;
    width: 54%;
    pointer-events: none;
    content: '';
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.58), rgba(125, 224, 203, 0.28), transparent);
    opacity: 0.84;
    mix-blend-mode: screen;
}

.chromatic-overlay {
    position: absolute;
    inset: 0;
    z-index: 4;
    pointer-events: none;
    background:
        radial-gradient(circle at 22% 18%, rgba(255, 226, 108, 0.22), transparent 24%),
        radial-gradient(circle at 80% 25%, rgba(76, 211, 194, 0.22), transparent 22%),
        linear-gradient(135deg, rgba(255, 255, 255, 0.06), transparent 42%, rgba(255, 183, 220, 0.12));
    mix-blend-mode: screen;
}

.chromatic-overlay span {
    position: absolute;
    right: 9%;
    top: 7%;
    padding: 0.45rem 0.62rem;
    border: 1px solid rgba(255, 255, 255, 0.68);
    background: rgba(26, 35, 42, 0.72);
    color: #fff8d8;
    font-size: 0.68rem;
    font-weight: 950;
    letter-spacing: 0.12em;
    line-height: 1;
    text-transform: uppercase;
    box-shadow: 0 10px 24px rgba(22, 26, 33, 0.24);
    backdrop-filter: blur(10px);
}

.travel-polaroid-copy {
    min-width: 0;
    padding: clamp(0.3rem, 1.5vw, 1rem);
}

.travel-polaroid-copy h3 {
    color: #382317;
    font-size: clamp(1.15rem, 2.2vw, 1.8rem);
    font-weight: 950;
    line-height: 1.1;
}

.travel-polaroid-copy p {
    max-width: 52ch;
    margin-top: 0.65rem;
    color: #6d4b38;
    font-size: clamp(0.94rem, 1.3vw, 1.05rem);
    line-height: 1.6;
}

.travel-polaroid:nth-child(even) .travel-polaroid-copy p {
    margin-left: auto;
}

.polaroid-carousel.is-running .travel-polaroid:hover {
    z-index: 2;
    transform: translateY(-5px);
    filter: saturate(1.05);
}

.polaroid-carousel.is-running .travel-polaroid:hover .travel-polaroid-visual {
    transform: rotate(0deg);
}

.polaroid-shift-move,
.polaroid-shift-enter-active,
.polaroid-shift-leave-active {
    transition:
        opacity 820ms cubic-bezier(0.16, 1, 0.3, 1),
        transform 820ms cubic-bezier(0.16, 1, 0.3, 1),
        filter 820ms cubic-bezier(0.16, 1, 0.3, 1);
}

.polaroid-shift-enter-from {
    opacity: 0;
    filter: blur(10px);
    transform: translateY(44px) scale(0.97);
}

.polaroid-shift-leave-to {
    opacity: 0;
    filter: blur(10px);
    transform: translateY(-44px) scale(0.97);
}

.polaroid-shift-leave-active {
    position: absolute;
    right: clamp(1rem, 3vw, 2.25rem);
    left: clamp(1rem, 3vw, 2.25rem);
}

.magic-title {
    font-size: clamp(3.2rem, 9vw, 8rem);
    font-weight: 950;
    line-height: 0.92;
    text-shadow: 0 0 26px rgba(255, 255, 255, 0.42);
}

.magic-tools {
    display: flex;
    gap: 16px;
}

.magic-tools span {
    display: block;
    width: 18px;
    height: 132px;
    border-radius: 999px;
    background: linear-gradient(#fde68a, #fff, #7c3aed);
    box-shadow: 0 0 24px rgba(253, 230, 138, 0.55);
    transform: rotate(var(--tilt, 12deg));
}

.magic-tools span:nth-child(2) {
    --tilt: -8deg;
    height: 96px;
}

.magic-tools span:nth-child(3) {
    --tilt: 18deg;
    height: 116px;
}

.magic-card {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 2rem;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 24px 80px rgba(38, 17, 63, 0.28);
    backdrop-filter: blur(16px);
}

.weapon-rule {
    width: min(640px, 100%);
    height: 18px;
    background: linear-gradient(90deg, transparent, #d1a56f 12%, #f5ead9 50%, #d1a56f 88%, transparent);
    clip-path: polygon(0 50%, 8% 0, 92% 0, 100% 50%, 92% 100%, 8% 100%);
}

.dragon-grid-lines {
    opacity: 0.28;
    background:
        linear-gradient(90deg, rgba(245, 234, 217, 0.1) 1px, transparent 1px),
        linear-gradient(rgba(245, 234, 217, 0.08) 1px, transparent 1px);
    background-size: 54px 54px;
    mask-image: radial-gradient(circle at 50% 40%, black, transparent 72%);
}

.dragon-header {
    display: grid;
    gap: clamp(1.5rem, 4vw, 3rem);
    align-items: end;
}

.dragon-header > p {
    max-width: 610px;
    color: rgba(245, 234, 217, 0.76);
    font-size: clamp(1.05rem, 1.8vw, 1.3rem);
    line-height: 1.7;
}

.dragon-title {
    color: #f5ead9;
    font-size: clamp(3rem, 9vw, 7.4rem);
    font-weight: 950;
    line-height: 0.86;
    text-transform: uppercase;
    text-shadow: 0 10px 0 rgba(78, 31, 14, 0.8), 0 0 34px rgba(209, 165, 111, 0.34);
}

.dragon-gallery {
    display: grid;
    gap: clamp(1.1rem, 2.5vw, 1.8rem);
}

.dragon-card {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 0.92fr) minmax(0, 1fr);
    gap: clamp(0.75rem, 1.8vw, 1.25rem);
    align-items: stretch;
    min-width: 0;
    padding: clamp(0.7rem, 1.5vw, 1rem);
    border: 1px solid rgba(209, 165, 111, 0.24);
    background:
        linear-gradient(135deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.035)),
        rgba(18, 15, 11, 0.72);
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
    backdrop-filter: blur(14px);
    animation-delay: var(--dragon-delay);
}

.dragon-card:nth-child(even) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.92fr);
}

.dragon-card:nth-child(even) .dragon-frame {
    order: 2;
}

.dragon-card:nth-child(even) .dragon-copy {
    order: 1;
}

.dragon-card::before {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: '';
    border: 1px solid rgba(255, 255, 255, 0.08);
}

.dragon-frame {
    position: relative;
    display: grid;
    min-height: clamp(230px, 34vw, 380px);
    place-items: center;
    overflow: hidden;
    padding: 0;
    background:
        radial-gradient(circle at 50% 30%, rgba(209, 165, 111, 0.22), transparent 28%),
        linear-gradient(180deg, rgba(245, 234, 217, 0.08), rgba(0, 0, 0, 0.22));
    transform: rotate(var(--dragon-tilt));
    box-shadow: inset 0 0 0 1px rgba(209, 165, 111, 0.22);
}

.dragon-frame::after {
    position: absolute;
    inset: 10px;
    pointer-events: none;
    content: '';
    border: 1px solid rgba(245, 234, 217, 0.18);
}

.dragon-frame img {
    width: 100%;
    height: 100%;
    max-height: clamp(230px, 36vw, 420px);
    object-fit: contain;
    object-position: center 28%;
    transition:
        scale 520ms ease,
        filter 520ms ease;
}

.dragon-card:hover .dragon-frame img {
    scale: 1.035;
    filter: saturate(1.08) contrast(1.04);
}

.dragon-copy {
    display: flex;
    flex-direction: column;
    justify-content: end;
    min-width: 0;
    padding: clamp(0.75rem, 1.8vw, 1.35rem);
}

.dragon-copy span {
    color: rgba(209, 165, 111, 0.76);
    font-size: 0.78rem;
    font-weight: 950;
    letter-spacing: 0.22em;
}

.dragon-copy h3 {
    max-width: 13ch;
    margin-top: 0.9rem;
    color: #fff7e8;
    font-size: clamp(1.65rem, 3.6vw, 3.4rem);
    font-weight: 950;
    line-height: 0.9;
    text-transform: uppercase;
}

.dragon-copy p {
    max-width: 48ch;
    margin-top: 0.85rem;
    color: rgba(245, 234, 217, 0.76);
    font-size: clamp(0.98rem, 1.4vw, 1.08rem);
    line-height: 1.7;
}

.lucifer-header {
    max-width: 980px;
}

.lucifer-header h2 {
    max-width: 980px;
    margin-top: 1rem;
    color: #f2efe8;
    font-size: clamp(3.4rem, 10vw, 9rem);
    font-weight: 950;
    line-height: 0.85;
    text-transform: uppercase;
    text-shadow: 0 12px 0 rgba(47, 7, 7, 0.72), 0 0 34px rgba(236, 72, 153, 0.25);
}

.lucifer-header > p:last-child {
    max-width: 680px;
    margin-top: 2rem;
    color: #c9b8ad;
    font-size: clamp(1.08rem, 1.8vw, 1.28rem);
    line-height: 1.75;
}

.lucifer-gallery {
    display: grid;
    gap: clamp(1rem, 2vw, 1.5rem);
}

.lucifer-gallery.is-single {
    max-width: 1080px;
}

.lucifer-card {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.72fr);
    gap: clamp(1rem, 3vw, 2rem);
    align-items: stretch;
    padding: clamp(0.85rem, 2vw, 1.25rem);
    border: 1px solid rgba(236, 72, 153, 0.24);
    background:
        radial-gradient(circle at 28% 18%, rgba(56, 189, 248, 0.18), transparent 24%),
        radial-gradient(circle at 86% 18%, rgba(236, 72, 153, 0.18), transparent 22%),
        linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.025));
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.62), 0 28px 90px rgba(0, 0, 0, 0.34);
    backdrop-filter: blur(14px);
}

.lucifer-frame {
    position: relative;
    display: grid;
    min-height: clamp(360px, 58vw, 680px);
    place-items: center;
    overflow: hidden;
    padding: 0;
    background:
        linear-gradient(180deg, rgba(8, 12, 24, 0.2), rgba(0, 0, 0, 0.38)),
        #08080a;
}

.lucifer-frame::after {
    position: absolute;
    inset: 12px;
    pointer-events: none;
    content: '';
    border: 1px solid rgba(236, 72, 153, 0.18);
    box-shadow: inset 0 0 42px rgba(56, 189, 248, 0.1);
}

.lucifer-frame img {
    width: 100%;
    height: 100%;
    max-height: clamp(360px, 60vw, 720px);
    object-fit: contain;
    object-position: center;
}

.lucifer-copy {
    display: flex;
    flex-direction: column;
    justify-content: end;
    min-width: 0;
    padding: clamp(1rem, 2.6vw, 2rem);
}

.lucifer-copy span {
    color: rgba(236, 72, 153, 0.72);
    font-size: 0.78rem;
    font-weight: 950;
    letter-spacing: 0.24em;
}

.lucifer-copy h3 {
    max-width: 12ch;
    margin-top: 1rem;
    color: #f6eee9;
    font-size: clamp(2rem, 5vw, 5rem);
    font-weight: 950;
    line-height: 0.88;
    text-transform: uppercase;
}

.lucifer-copy p {
    max-width: 46ch;
    margin-top: 1rem;
    color: rgba(231, 223, 216, 0.76);
    font-size: clamp(1rem, 1.45vw, 1.12rem);
    line-height: 1.7;
}

.rpg-card,
.lucifer-card,
.lab-card,
.mirror-card,
.sweet-card {
    overflow: hidden;
    border-radius: 1.75rem;
}

.rpg-card {
    border: 1px solid rgba(209, 165, 111, 0.28);
    background: rgba(255, 255, 255, 0.06);
    padding: 1rem;
}

.sweet-card {
    width: min(330px, 74vw);
    flex: 0 0 auto;
    scroll-snap-align: center;
    background: rgba(255, 255, 255, 0.62);
    padding: 1rem 1rem 1.5rem;
    box-shadow: 0 26px 70px rgba(133, 65, 82, 0.18);
}

.lab-card {
    background: rgba(255, 255, 255, 0.78);
    padding: 1rem;
    box-shadow: 0 20px 60px rgba(21, 26, 34, 0.12);
}

.mirror-card {
    border: 1px solid rgba(17, 24, 39, 0.12);
    background: rgba(255, 255, 255, 0.72);
    padding: 1rem;
    box-shadow: 0 24px 80px rgba(17, 24, 39, 0.12);
}

.mirror-card-dark {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.06);
}

.motion-safe\:animate-float-in,
.motion-safe\:animate-rise-in {
    animation-fill-mode: both;
}

@media (prefers-reduced-motion: no-preference) {
    .section-stage .motion-safe\:animate-float-in,
    .section-stage .motion-safe\:animate-rise-in {
        animation: none;
    }

    .section-stage.is-visible .chakra-orb {
        animation: chakraPulse 3.8s ease-in-out 900ms infinite;
    }

    .section-stage.is-visible .magic-tools span {
        animation: toolDrift 3.4s ease-in-out calc(var(--reveal-delay, 0ms) + 700ms) infinite;
    }

    .section-stage.is-visible .travel-polaroid.is-chromatic .travel-polaroid-visual {
        animation: chromaticPulse 4.4s ease-in-out calc(var(--reveal-delay, 0ms) + 700ms) infinite;
    }

    .section-stage.is-visible .travel-polaroid.is-chromatic .travel-polaroid-visual::after {
        animation: chromaticSweep 3.8s cubic-bezier(0.16, 1, 0.3, 1) calc(var(--reveal-delay, 0ms) + 500ms) infinite;
    }

    .section-stage.is-visible :is(.sweet-card, .lab-card, .mirror-card) {
        animation: softBob 5.2s ease-in-out calc(var(--reveal-delay, 0ms) + 900ms) infinite;
    }

    .section-stage.is-visible article:not(.travel-polaroid) > div:first-child,
    .section-stage.is-visible .vestara-card,
    .section-stage.is-visible .solcatempo-mark {
        animation: visualBreath 6s ease-in-out 1s infinite;
    }
}

@media (min-width: 768px) {
    .magic-card {
        grid-template-columns: 0.9fr 1fr;
        align-items: center;
    }
}

@media (max-width: 767px) {
    .polaroid-carousel {
        gap: 1rem;
        width: min(100%, 430px);
        padding: 0.85rem;
    }

    .travel-polaroid,
    .travel-polaroid:nth-child(even) {
        grid-template-columns: 1fr;
        gap: 0.7rem;
        padding: 0.85rem;
    }

    .travel-polaroid:nth-child(even) .travel-polaroid-visual,
    .travel-polaroid:nth-child(even) .travel-polaroid-copy {
        order: initial;
        text-align: left;
    }

    .travel-polaroid-visual img {
        width: min(100%, 245px);
        max-height: min(34vh, 280px);
    }

    .travel-polaroid-copy {
        padding: 0.35rem 0.25rem 0.15rem;
    }

    .travel-polaroid-copy p,
    .travel-polaroid:nth-child(even) .travel-polaroid-copy p {
        max-width: none;
        margin-left: 0;
    }

    .chromatic-overlay span {
        right: 8%;
        top: 6%;
        font-size: 0.58rem;
    }

    .dragon-header {
        gap: 1.2rem;
    }

    .dragon-card,
    .dragon-card:nth-child(even) {
        grid-template-columns: 1fr;
    }

    .dragon-card:nth-child(even) .dragon-frame,
    .dragon-card:nth-child(even) .dragon-copy {
        order: initial;
    }

    .dragon-frame {
        min-height: min(60vh, 340px);
        transform: rotate(0deg);
    }

    .dragon-copy {
        padding: 0.75rem 0.45rem 0.45rem;
    }

    .dragon-copy h3 {
        max-width: 12ch;
        font-size: clamp(1.8rem, 12vw, 3.2rem);
    }

    .lucifer-card {
        grid-template-columns: 1fr;
        padding: 0.85rem;
    }

    .lucifer-frame {
        min-height: min(64vh, 430px);
    }

    .lucifer-frame img {
        max-height: min(64vh, 430px);
    }

    .lucifer-copy {
        padding: 0.8rem 0.45rem 0.45rem;
    }

    .lucifer-copy h3 {
        font-size: clamp(1.9rem, 13vw, 3.4rem);
    }
}

@media (min-width: 1280px) {
    .polaroid-carousel {
        max-width: 1120px;
    }

    .travel-polaroid {
        grid-template-columns: minmax(190px, 250px) minmax(0, 1fr);
    }

    .travel-polaroid:nth-child(even) {
        grid-template-columns: minmax(0, 1fr) minmax(190px, 250px);
    }
}

@media (min-width: 1024px) {
    .benandanti-spotlight {
        grid-template-columns: minmax(0, 1.1fr) minmax(360px, 0.9fr);
    }

    .dragon-header {
        grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.75fr);
    }

    .dragon-gallery {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .dragon-card,
    .dragon-card:nth-child(even) {
        grid-template-columns: 1fr;
    }

    .dragon-card:nth-child(even) .dragon-frame,
    .dragon-card:nth-child(even) .dragon-copy {
        order: initial;
    }

    .dragon-card:nth-child(even) .dragon-frame {
        transform: rotate(calc(var(--dragon-tilt) * -1));
    }
}
</style>
