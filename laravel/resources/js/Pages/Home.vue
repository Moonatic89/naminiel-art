<script setup>
import { Head, Link } from '@inertiajs/vue3';
import PublicLayout from '@/Layouts/PublicLayout.vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import cyanWave from '../../../../src/assets/wave/cyanWave.png';
import redWave from '../../../../src/assets/wave/redWave.png';

const originalImage = 'https://hqbmfndntgzbgprrbrhm.supabase.co/storage/v1/object/public/nav/nav_venerdi.webp';
const fanArtImage = 'https://hqbmfndntgzbgprrbrhm.supabase.co/storage/v1/object/public/nav/nav_goku.webp';
const logoVideo = '/media/hero/naminiel-logo.webm';
const logoPoster = '/media/hero/naminiel-logo-poster.webp';
const interactionsEnabled = false;

const introRevealed = ref(false);
const introDone = ref(false);
const currentState = ref('right');
const introKey = 'naminiel_intro_shown';
let introTimeout = null;
let sectionObserver = null;
let benandantiTimer = null;

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

const activeBenandanteIndex = ref(0);
const benandanti = [
    {
        name: 'Kumirai',
        chakra: 'Terzo occhio',
        image: '/media/benandanti/kumirai.webp',
        full: 'Saggio e imperturbabile, Kumirai protegge dalle illusioni. Dorme al centro della radura come se la foresta fosse nata attorno a lui: solitario, ma mai davvero solo, veglia sui sogni e attende la sera in cui parlera.',
        short: 'Saggezza quieta, protezione dalle illusioni.',
    },
    {
        name: 'Selvanello',
        chakra: 'Radici',
        image: '/media/benandanti/selvanello.webp',
        full: 'Giocoso, buffo e profondamente legato alla natura, Selvanello sa trasformarsi quando serve difendere la terra. Dietro l agitazione e le corse improvvise c e un cuore protettivo, pronto a difendere il proprio giardino.',
        short: 'Spirito giocoso, radice e protezione.',
    },
    {
        name: 'Druden',
        chakra: 'Voce',
        image: '/media/benandanti/druden.webp',
        full: 'La Druden cambia forma e sa parlare al cuore di chi incontra. Aiuta a comunicare, a riconoscere le bugie e a rientrare nel calore di una casa, anche quando la foresta sembra chiamare ancora.',
        short: 'Forma mutevole, verita e dialogo.',
    },
    {
        name: 'Lumira',
        chakra: 'Cuore',
        image: '/media/benandanti/lumira.webp',
        full: 'Piccolo e coraggioso, Lumira si nutre delle emozioni negative e le trasforma in luce. Porta conforto nei momenti bui, assorbendo la paura con una dolcezza che sembra farla svanire.',
        short: 'Conforto luminoso contro la paura.',
    },
    {
        name: 'Dama Bianca',
        chakra: 'Corona',
        image: '/media/benandanti/dama-bianca.webp',
        full: 'Malinconica e celeste, la Dama Bianca osserva con occhi ammantati di cosmo e canta una melodia dolce. Raccoglie chi cerca qualcosa oltre il mondo visibile, trasformando la tristezza in ascolto.',
        short: 'Canto cosmico, malinconia e visione.',
    },
    {
        name: 'Alopisco',
        chakra: 'Plesso solare',
        image: '/media/benandanti/alopisco.webp',
        full: 'Sovrano della foresta e fonte di energia, Alopisco incarna volonta, potere e forza vitale. Splende come un sole antico: chi lo segue ritrova calore, presenza e determinazione.',
        short: 'Sole interiore, forza e volonta.',
    },
    {
        name: 'Lullaknight',
        chakra: 'Musa',
        image: '/media/benandanti/lullaknight.webp',
        full: 'Protettrice degli artisti, Lullaknight culla con una melodia dolce chi crede nella propria arte. Ma il suo canto non e solo preghiera: e giudizio, lama e promessa da rispettare.',
        short: 'Musa armata, arte e giudizio.',
    },
];
const activeBenandante = computed(() => benandanti[activeBenandanteIndex.value]);

const polaroids = [
    ['Rotte leggere', 'Uno scatto rubato tra stazioni, mappe e compagni di viaggio.', 'from-[#f7e6b9] via-[#b5e5e0] to-[#f59e7b]'],
    ['Bosco tascabile', 'Creature in cammino, foglie negli zaini e cielo da esplorare.', 'from-[#d8f3c5] via-[#7ccf9b] to-[#335c4b]'],
    ['Ora blu', 'Quando la squadra si ferma e il mondo sembra una cartolina.', 'from-[#d8e8ff] via-[#778bd8] to-[#242b5f]'],
    ['Ritorno a casa', 'La foto finale, storta il giusto, con il cuore al centro.', 'from-[#ffe2ea] via-[#ffa7a5] to-[#70404a]'],
];

const magicalGirls = [
    ['Luna a nastro', 'Una trasformazione morbida, piena di promesse luminose.', 'from-[#ffbad5] via-[#ffd8f1] to-[#7656d8]'],
    ['Libro sigillato', 'Pagine vive, formule gentili e una punta di caos.', 'from-[#5d3f8f] via-[#d8b4fe] to-[#fef3c7]'],
    ['Scettro meteora', 'Una majokko che lascia scintille al posto dei dubbi.', 'from-[#9ce7ff] via-[#f0abfc] to-[#facc15]'],
    ['Specchio viola', 'Eleganza, segreti e un potere che cambia forma.', 'from-[#2e1065] via-[#a855f7] to-[#f5d0fe]'],
];

const roleplay = [
    ['Lama del Patto', 'Un guerriero custom con armatura cerimoniale e troppi segreti.', 'from-[#171717] via-[#3f2f1f] to-[#d6a157]'],
    ['Dado Cremisi', 'Incantesimi, fallimenti critici e gloria improvvisata.', 'from-[#34111a] via-[#8f1d35] to-[#ffb86b]'],
    ['Taverna Nebbia', 'Personaggi pronti a entrare in campagna con una backstory viva.', 'from-[#111827] via-[#374151] to-[#93c5fd]'],
    ['Reliquia Bianca', 'Un chierico, una spada curva, una domanda scomoda.', 'from-[#201a12] via-[#725f45] to-[#f5e7c4]'],
];

const lucifer = [
    ['Cenere', 'La prima alba dopo la fine non perdona nessuno.', 'from-[#070707] via-[#2a0d0d] to-[#7f1d1d]'],
    ['Asfalto Sacro', 'Lucifero cammina tra insegne bruciate e preghiere rotte.', 'from-[#111111] via-[#3a2a21] to-[#c2410c]'],
    ['Corona Nera', 'Non e redenzione: e presenza, fame, ritorno.', 'from-[#030303] via-[#171717] to-[#a16207]'],
    ['Ultima Sirena', 'Una citta sporca, ancora viva, ancora in ascolto.', 'from-[#09090b] via-[#27272a] to-[#991b1b]'],
];

const pamsticceria = [
    ['Lumacaron', 'Guscio lento, crema veloce, zucchero ovunque.', 'from-[#fde68a] via-[#f9a8d4] to-[#fb7185]'],
    ['Milk Snake', 'Latte, vaniglia e strisce da dessert impossibile.', 'from-[#fff7ed] via-[#fdba74] to-[#7c2d12]'],
    ['Tortartaruga', 'Una cupola glassata con cuore di frutta.', 'from-[#bbf7d0] via-[#86efac] to-[#fef08a]'],
    ['Bignorso', 'Morbido, gigante, pronto a sporcarsi di panna.', 'from-[#fecaca] via-[#fca5a5] to-[#78350f]'],
    ['Cignocannolo', 'Elegante come una vetrina prima dell apertura.', 'from-[#e0f2fe] via-[#fef3c7] to-[#f472b6]'],
    ['Pavoncake', 'Colori alti, piume di zucchero, festa totale.', 'from-[#c4b5fd] via-[#67e8f9] to-[#fb7185]'],
];

const characterLab = [
    ['Pose sheet', 'Studio pulito per silhouette e outfit.', 'from-[#e5e7eb] via-[#94a3b8] to-[#111827]'],
    ['Color key', 'Palette, contrasti e piccoli dettagli narrativi.', 'from-[#fef3c7] via-[#f97316] to-[#1f2937]'],
    ['Expression pass', 'Volti rapidi, intenzioni leggibili, energia.', 'from-[#dbeafe] via-[#60a5fa] to-[#312e81]'],
    ['Final card', 'Il personaggio pronto per essere presentato.', 'from-[#f5f5f4] via-[#d6d3d1] to-[#292524]'],
];

const ocCards = [
    ['Archivio', 'Personaggi originali con radici, contraddizioni e presenza.', 'from-[#111827] via-[#4338ca] to-[#f97316]'],
    ['Silhouette', 'Figure riconoscibili anche prima del colore.', 'from-[#111111] via-[#404040] to-[#fafafa]'],
    ['Relazioni', 'Legami, tensioni e piccoli mondi personali.', 'from-[#1f2937] via-[#be123c] to-[#f8fafc]'],
    ['Ritratto', 'Una posa ferma, uno sguardo che resta.', 'from-[#0f172a] via-[#475569] to-[#f5f5f4]'],
];

const fanartCards = [
    ['Omaggio', 'Fanart con rispetto per la fonte e mano personale.', 'from-[#fafafa] via-[#fca5a5] to-[#111827]'],
    ['Icona', 'Personaggi noti riscritti con taglio illustrativo.', 'from-[#fef2f2] via-[#f97316] to-[#7f1d1d]'],
    ['Scena', 'Un momento riconoscibile, composto come una stampa.', 'from-[#f8fafc] via-[#38bdf8] to-[#1e293b]'],
    ['Energia', 'Il gesto giusto, prima che l immagine scappi.', 'from-[#fff7ed] via-[#facc15] to-[#111827]'],
];

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
    activeBenandanteIndex.value = (activeBenandanteIndex.value + 1) % benandanti.length;
}

function startBenandantiCarousel() {
    clearInterval(benandantiTimer);
    benandantiTimer = setInterval(advanceBenandante, 6200);
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
    });

    startBenandantiCarousel();
});

onBeforeUnmount(() => {
    clearTimeout(introTimeout);
    clearInterval(benandantiTimer);
    window.removeEventListener('resize', updateViewport);
    sectionObserver?.disconnect();
});
</script>

<template>
    <PublicLayout no-page-offset>
        <Head title="Naminiel" />

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
                    aria-label="Naminiel Art"
                >
                    <source :src="logoVideo" type="video/webm" />
                    <img :src="logoPoster" alt="Naminiel Art" />
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
                        aria-label="Mostra Fan Art"
                        :disabled="!interactionsEnabled"
                        @mouseenter="startWave('right')"
                        @focus="startWave('right')"
                    />
                    <button
                        class="hidden h-full w-2/5 cursor-default md:block"
                        type="button"
                        aria-label="Mostra Original Art"
                        :disabled="!interactionsEnabled"
                        @mouseenter="startWave('left')"
                        @focus="startWave('left')"
                    />
                    <button
                        class="block h-2/5 w-full cursor-default md:hidden"
                        type="button"
                        aria-label="Mostra Fan Art"
                        :disabled="!interactionsEnabled"
                        @touchstart="startWave('right')"
                    />
                    <button
                        class="block h-2/5 w-full cursor-default md:hidden"
                        type="button"
                        aria-label="Mostra Original Art"
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
                        aria-label="Naminiel Art"
                    >
                        <source :src="logoVideo" type="video/webm" />
                        <img :src="logoPoster" alt="Naminiel Art" />
                    </video>
                </div>

                <div class="pointer-events-none absolute inset-0 top-[56px] z-30 flex flex-col items-center justify-between px-4 pb-8 md:top-36 md:flex-row md:items-start md:px-8 md:pb-0">
                    <div class="pointer-events-auto flex w-[28%] cursor-default flex-col items-center gap-2 animate-slide-in-left md:w-1/4 xl:w-1/3">
                        <Link :href="route('art.og')" aria-disabled="true" tabindex="-1" class="flex cursor-default flex-col items-center gap-1" @click.prevent>
                            <img :src="originalImage" alt="Original Art" class="h-auto w-full drop-shadow-lg" />
                            <span class="text-xs font-bold uppercase tracking-widest text-white/0 drop-shadow-md">Original</span>
                        </Link>
                    </div>

                    <div class="hidden flex-1 md:block" />

                    <div class="pointer-events-auto flex w-[28%] cursor-default flex-col items-center gap-2 animate-slide-in-right md:w-1/4 xl:w-1/3">
                        <Link :href="route('art.fa')" aria-disabled="true" tabindex="-1" class="flex cursor-default flex-col items-center gap-1" @click.prevent>
                            <img :src="fanArtImage" alt="Fan Art" class="h-auto w-full drop-shadow-lg" />
                            <span class="text-xs font-bold uppercase tracking-widest text-white/0 drop-shadow-md">Fan Art</span>
                        </Link>
                    </div>
                </div>

                <div class="pointer-events-none absolute bottom-6 left-0 right-0 z-30 flex justify-between px-6 md:hidden">
                    <span class="w-[28%] text-center text-[10px] font-bold uppercase tracking-widest text-white/80 drop-shadow">Original</span>
                    <span class="w-[28%] text-center text-[10px] font-bold uppercase tracking-widest text-white/80 drop-shadow">Fan Art</span>
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
                        <p class="section-kicker text-white/70">01 / Progetto attivo</p>
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
                            Un logo-mondo fatto di tempo, vento e lama, pronto per diventare il portale principale della saga.
                        </p>
                        <div class="mt-8 h-3 rounded-full bg-gradient-to-r from-[#ef7b2d] via-[#55c6d6] to-[#1f336f]" />
                    </div>
                </div>
            </section>

            <section class="project-section section-stage bg-[#f5f0e8] text-[#183466]">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(247,169,55,.35),transparent_28%),radial-gradient(circle_at_75%_25%,rgba(71,168,185,.25),transparent_24%)]" />
                <div class="project-shell relative z-10 flex flex-col items-center justify-center text-center">
                    <p class="section-kicker text-[#183466]/60">02 / Solcatempo</p>
                    <div class="vestara-card mt-8 w-full max-w-5xl rounded-[2.5rem] border-[10px] border-white bg-[#fbf7ef] px-6 py-12 shadow-[0_30px_90px_rgba(24,52,102,.22)] md:px-16">
                        <div class="mx-auto max-w-4xl">
                            <div class="text-[clamp(3.4rem,14vw,10rem)] font-black leading-[.78] text-[#f28a2e] drop-shadow-[0_8px_0_#20356c]">S</div>
                            <h2 class="mt-2 text-[clamp(2.4rem,8vw,7rem)] font-black uppercase leading-none tracking-normal text-[#17305f]">Solcatempo</h2>
                            <p class="mt-4 font-serif text-[clamp(2rem,5vw,4.5rem)] font-bold text-[#244577]">Il Battito di Vestara</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="project-section section-stage bg-[#07110b] text-[#f4f0dd]">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(61,107,67,.45),transparent_28%),radial-gradient(circle_at_80%_25%,rgba(178,140,68,.2),transparent_26%),linear-gradient(180deg,#07110b,#020403)]" />
                <div class="project-shell relative z-10">
                    <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p class="section-kicker text-[#b8c8a4]">03 / Guardiani karmici</p>
                            <h2 class="benandanti-logo mt-4">Benandanti</h2>
                        </div>
                        <p class="max-w-xl text-lg leading-8 text-[#d6dec8]">Creature mistiche, fantasy e protettive: ogni guardiano custodisce un centro, una ferita, un passaggio.</p>
                    </div>
                    <div class="benandanti-carousel mt-12">
                        <div class="benandanti-spotlight" :key="activeBenandante.name">
                            <div class="benandanti-portrait">
                                <img :src="activeBenandante.image" :alt="activeBenandante.name" />
                                <div class="chakra-orb" />
                            </div>
                            <div class="benandanti-copy">
                                <p class="text-sm font-black uppercase tracking-[0.24em] text-[#d6c57f]">{{ activeBenandante.chakra }}</p>
                                <h3>{{ activeBenandante.name }}</h3>
                                <p>{{ activeBenandante.full }}</p>
                            </div>
                        </div>

                        <div class="benandanti-track" aria-label="Seleziona Benandante">
                            <button
                                v-for="(item, index) in benandanti"
                                :key="item.name"
                                type="button"
                                class="benandanti-thumb"
                                :class="{ 'is-active': index === activeBenandanteIndex }"
                                @click="selectBenandante(index); startBenandantiCarousel()"
                            >
                                <img :src="item.image" :alt="item.name" />
                                <span>{{ item.name }}</span>
                                <small>{{ item.short }}</small>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section class="project-section section-stage bg-[#f6ecd9] text-[#36251d]">
                <div class="project-shell relative z-10">
                    <div class="mx-auto max-w-3xl text-center">
                        <p class="section-kicker text-[#8a6751]">04 / Polaroid Pokemon</p>
                        <h2 class="mt-4 text-[clamp(3rem,9vw,8rem)] font-black leading-none">Il grande Viaggio</h2>
                    </div>
                    <div class="mt-14 space-y-12">
                        <article v-for="(item, index) in polaroids" :key="item[0]" class="polaroid-row" :class="index % 2 ? 'md:flex-row-reverse' : ''">
                            <div class="polaroid-frame motion-safe:animate-float-in" :style="{ animationDelay: `${index * 120}ms` }">
                                <div class="h-72 bg-gradient-to-br" :class="item[2]" />
                                <p class="mt-5 font-hand text-2xl">{{ item[0] }}</p>
                            </div>
                            <p class="max-w-md text-xl leading-8">{{ item[1] }}</p>
                        </article>
                    </div>
                </div>
            </section>

            <section class="project-section section-stage bg-[#26113f] text-white">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(250,204,21,.45),transparent_18%),radial-gradient(circle_at_88%_25%,rgba(236,72,153,.36),transparent_22%),linear-gradient(145deg,#26113f,#6d28d9_48%,#f9a8d4)]" />
                <div class="project-shell relative z-10">
                    <div class="flex flex-wrap items-center justify-between gap-8">
                        <div>
                            <p class="section-kicker text-white/70">05 / Majokko collection</p>
                            <h2 class="magic-title mt-4">Magikal Girls</h2>
                        </div>
                        <div class="magic-tools" aria-hidden="true">
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>
                    <div class="mt-16 grid gap-6 md:grid-cols-2">
                        <article v-for="(item, index) in magicalGirls" :key="item[0]" class="magic-card motion-safe:animate-float-in" :style="{ animationDelay: `${index * 90}ms` }">
                            <div class="h-56 rounded-[1.5rem] bg-gradient-to-br" :class="item[2]" />
                            <div>
                                <h3 class="text-3xl font-black">{{ item[0] }}</h3>
                                <p class="mt-3 leading-7 text-white/78">{{ item[1] }}</p>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            <section class="project-section section-stage bg-[#120f0b] text-[#f5ead9]">
                <div class="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,.04)_1px,transparent_1px),radial-gradient(circle_at_70%_20%,rgba(182,132,67,.28),transparent_24%)] [background-size:42px_42px,100%_100%]" />
                <div class="project-shell relative z-10">
                    <p class="section-kicker text-[#d1a56f]">06 / Gioco di ruolo</p>
                    <h2 class="mt-4 text-[clamp(3rem,8vw,7.5rem)] font-black uppercase leading-none">Customs & Dragons</h2>
                    <div class="weapon-rule mt-8" />
                    <div class="mt-12 grid gap-5 md:grid-cols-4">
                        <article v-for="(item, index) in roleplay" :key="item[0]" class="rpg-card motion-safe:animate-rise-in" :style="{ animationDelay: `${index * 110}ms` }">
                            <div class="h-52 bg-gradient-to-br" :class="item[2]" />
                            <h3 class="mt-5 text-2xl font-black">{{ item[0] }}</h3>
                            <p class="mt-3 text-sm leading-6 text-[#e9d8bd]/80">{{ item[1] }}</p>
                        </article>
                    </div>
                </div>
            </section>

            <section class="project-section section-stage bg-[#050505] text-[#e7dfd8]">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_70%,rgba(127,29,29,.5),transparent_28%),linear-gradient(180deg,#050505,#171717_45%,#2b0707)]" />
                <div class="absolute inset-x-0 top-0 h-24 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,.08)_0_1px,transparent_1px_12px)] opacity-40" />
                <div class="project-shell relative z-10">
                    <p class="section-kicker text-[#b45309]">07 / Dopo l apocalisse</p>
                    <h2 class="mt-4 max-w-5xl text-[clamp(3.4rem,10vw,9rem)] font-black uppercase leading-[.85] text-[#f2efe8]">Project Lucifer</h2>
                    <p class="mt-8 max-w-2xl text-xl leading-9 text-[#c9b8ad]">Lucifero arriva sulla terra quando tutto e gia crollato. Non porta la fine: trova cio che resta.</p>
                    <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <article v-for="(item, index) in lucifer" :key="item[0]" class="lucifer-card motion-safe:animate-rise-in" :style="{ animationDelay: `${index * 100}ms` }">
                            <div class="h-56 bg-gradient-to-br" :class="item[2]" />
                            <h3 class="mt-5 text-2xl font-black">{{ item[0] }}</h3>
                            <p class="mt-3 leading-7 text-[#d7cbc1]/78">{{ item[1] }}</p>
                        </article>
                    </div>
                </div>
            </section>

            <section class="project-section section-stage bg-[#fff3c7] text-[#5c2f2b]">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(244,114,182,.42),transparent_20%),radial-gradient(circle_at_85%_18%,rgba(45,212,191,.32),transparent_24%),linear-gradient(140deg,#fff3c7,#ffc4d6_52%,#a7f3d0)]" />
                <div class="project-shell relative z-10">
                    <div class="text-center">
                        <p class="section-kicker text-[#8f4f45]">08 / Pasticceria bestiale</p>
                        <h2 class="mt-4 text-[clamp(3rem,9vw,8rem)] font-black leading-none">Pamsticceria</h2>
                    </div>
                    <div class="mt-12 flex snap-x gap-5 overflow-x-auto px-[8vw] pb-8 md:px-0">
                        <article v-for="(item, index) in pamsticceria" :key="item[0]" class="sweet-card" :style="{ transform: `rotate(${index % 2 ? 3 : -3}deg)` }">
                            <div class="h-64 rounded-[2rem] bg-gradient-to-br" :class="item[2]" />
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
                            <p class="section-kicker text-[#667085]">09 / Character Lab</p>
                            <h2 class="mt-4 text-[clamp(3rem,8vw,7rem)] font-black uppercase leading-none">Commissioni vive</h2>
                            <p class="mt-6 text-xl leading-8 text-[#475467]">Una sezione ponte per studi, schede e personaggi su misura, utile finche i progetti attivi crescono.</p>
                        </div>
                        <div class="grid gap-4 sm:grid-cols-2">
                            <article v-for="(item, index) in characterLab" :key="item[0]" class="lab-card motion-safe:animate-float-in" :style="{ animationDelay: `${index * 90}ms` }">
                                <div class="h-44 rounded-2xl bg-gradient-to-br" :class="item[2]" />
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
                        <p class="section-kicker text-white/55">10 / Original Characters</p>
                        <h2 class="mt-4 text-[clamp(4rem,10vw,9rem)] font-black uppercase leading-none">OC</h2>
                        <p class="mt-6 max-w-xl text-xl leading-8 text-white/68">Elegante, compatta, incisiva: il lato originale come archivio di identita e mondi personali.</p>
                    </div>
                    <div class="grid gap-5 sm:grid-cols-2">
                        <article v-for="(item, index) in ocCards" :key="item[0]" class="mirror-card mirror-card-dark motion-safe:animate-rise-in" :style="{ animationDelay: `${index * 100}ms` }">
                            <div class="h-52 rounded-[1.25rem] bg-gradient-to-br" :class="item[2]" />
                            <h3 class="mt-5 text-2xl font-black">{{ item[0] }}</h3>
                            <p class="mt-3 leading-7 text-white/64">{{ item[1] }}</p>
                        </article>
                    </div>
                </div>
            </section>

            <section class="project-section section-stage bg-[#f7f4ef] text-[#111827]">
                <div class="project-shell relative z-10 grid gap-10 lg:grid-cols-2 lg:items-center">
                    <div class="order-2 grid gap-5 sm:grid-cols-2 lg:order-1">
                        <article v-for="(item, index) in fanartCards" :key="item[0]" class="mirror-card motion-safe:animate-rise-in" :style="{ animationDelay: `${index * 100}ms` }">
                            <div class="h-52 rounded-[1.25rem] bg-gradient-to-br" :class="item[2]" />
                            <h3 class="mt-5 text-2xl font-black">{{ item[0] }}</h3>
                            <p class="mt-3 leading-7 text-[#4b5563]">{{ item[1] }}</p>
                        </article>
                    </div>
                    <div class="order-1 text-right lg:order-2">
                        <p class="section-kicker text-[#6b7280]">11 / Fan Art</p>
                        <h2 class="mt-4 text-[clamp(4rem,10vw,9rem)] font-black uppercase leading-none">Fanart</h2>
                        <p class="ml-auto mt-6 max-w-xl text-xl leading-8 text-[#4b5563]">Speculare agli OC, ma piu tagliente: omaggi, icone e scene riconoscibili con una firma personale.</p>
                    </div>
                </div>
            </section>
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

.section-stage :is(.section-kicker, h2, h3, p, article, .benandanti-spotlight, .benandanti-thumb, .solcatempo-mark, .solcatempo-s, .solcatempo-word, .solcatempo-blade, .solcatempo-leaf, .vestara-card, .chakra-orb, .polaroid-frame, .magic-tools, .magic-tools span, .weapon-rule, .magic-card, .rpg-card, .lucifer-card, .sweet-card, .lab-card, .mirror-card) {
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

.section-stage.is-visible :is(.section-kicker, h2, h3, p, article, .benandanti-spotlight, .benandanti-thumb, .solcatempo-mark, .solcatempo-s, .solcatempo-word, .solcatempo-blade, .solcatempo-leaf, .vestara-card, .chakra-orb, .polaroid-frame, .magic-tools, .magic-tools span, .weapon-rule, .magic-card, .rpg-card, .lucifer-card, .sweet-card, .lab-card, .mirror-card) {
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

.section-stage .polaroid-row:nth-child(even) .polaroid-frame,
.section-stage .polaroid-row:nth-child(even) > p {
    translate: 42px 0;
}

.section-stage .polaroid-row:nth-child(odd) .polaroid-frame,
.section-stage .polaroid-row:nth-child(odd) > p {
    translate: -42px 0;
}

.section-stage.is-visible .polaroid-row :is(.polaroid-frame, p) {
    translate: 0 0;
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
    margin-top: 0.65rem;
    font-family: Georgia, serif;
    font-size: clamp(3rem, 8vw, 7rem);
    font-weight: 900;
    line-height: 0.88;
    text-transform: uppercase;
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

.polaroid-row {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
    justify-content: center;
}

.polaroid-frame {
    width: min(410px, 86vw);
    padding: 18px 18px 34px;
    background: #fffaf0;
    box-shadow: 0 28px 80px rgba(54, 37, 29, 0.18);
}

.font-hand {
    font-family: Georgia, serif;
    font-style: italic;
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

.lucifer-card {
    border: 1px solid rgba(180, 83, 9, 0.28);
    background: rgba(255, 255, 255, 0.05);
    padding: 1rem;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.55);
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

    .section-stage.is-visible :is(.polaroid-frame, .sweet-card, .lab-card, .mirror-card) {
        animation: softBob 5.2s ease-in-out calc(var(--reveal-delay, 0ms) + 900ms) infinite;
    }

    .section-stage.is-visible article > div:first-child,
    .section-stage.is-visible .vestara-card,
    .section-stage.is-visible .solcatempo-mark {
        animation: visualBreath 6s ease-in-out 1s infinite;
    }
}

@media (min-width: 768px) {
    .polaroid-row {
        flex-direction: row;
        gap: 5rem;
    }

    .magic-card {
        grid-template-columns: 0.9fr 1fr;
        align-items: center;
    }
}

@media (min-width: 1024px) {
    .benandanti-spotlight {
        grid-template-columns: minmax(0, 1.1fr) minmax(360px, 0.9fr);
    }
}
</style>
