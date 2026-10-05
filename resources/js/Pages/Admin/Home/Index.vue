<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, router } from '@inertiajs/vue3';
import { computed, reactive, ref, watch } from 'vue';
import it from '@/i18n/locales/it';
import en from '@/i18n/locales/en';

const props = defineProps({
    sections: {
        type: Array,
        default: () => [],
    },
    locales: {
        type: Array,
        default: () => ['it', 'en'],
    },
    overrides: {
        type: Object,
        default: () => ({}),
    },
});

const defaultMessages = { it, en };
const selectedSectionKey = ref(props.sections[0]?.key ?? null);
const uploadInputs = reactive({});
const renameDrafts = reactive({});
const cardDrafts = reactive({});
const newCardDrafts = reactive({});
const textDrafts = reactive({});

const selectedSection = computed(() => props.sections.find((section) => section.key === selectedSectionKey.value) ?? props.sections[0]);

watch(() => props.sections, (sections) => {
    sections.forEach((section) => {
        newCardDrafts[section.key] ??= {
            slug: '',
            image_path: section.pool?.[0]?.path ?? '',
            translation_key: '',
            sort_order: section.cards?.length ?? 0,
            is_active: true,
            is_chromatic: false,
        };

        section.pool.forEach((file) => {
            renameDrafts[`${section.key}:${file.path}`] ??= file.filename;
        });

        section.cards.forEach((card) => {
            cardDrafts[`${section.key}:${card.id}`] ??= { ...card };
            seedCardTextDrafts(section.key, card.translation_key);
        });

        props.locales.forEach((locale) => {
            section.text_fields.forEach((field) => {
                const key = textDraftKey(section.key, null, locale, field);
                textDrafts[key] ??= overrideValue(section.key, null, locale, field) ?? defaultSectionValue(section.key, locale, field) ?? '';
            });
        });
    });
}, { immediate: true });

function textDraftKey(sectionKey, itemKey, locale, field) {
    return [sectionKey, itemKey || '__section', locale, field].join(':');
}

function seedCardTextDrafts(sectionKey, itemKey) {
    if (!itemKey) {
        return;
    }

    props.locales.forEach((locale) => {
        ['title', 'description'].forEach((field) => {
            const key = textDraftKey(sectionKey, itemKey, locale, field);
            textDrafts[key] ??= overrideValue(sectionKey, itemKey, locale, field) ?? defaultCardValue(sectionKey, itemKey, locale, field) ?? '';
        });
    });
}

function overrideValue(sectionKey, itemKey, locale, field) {
    return props.overrides?.[sectionKey]?.[itemKey || '__section']?.[locale]?.[field];
}

function defaultSectionValue(sectionKey, locale, field) {
    return defaultMessages[locale]?.home?.sections?.[sectionKey]?.[field];
}

function defaultCardValue(sectionKey, itemKey, locale, field) {
    return defaultMessages[locale]?.home?.sections?.[sectionKey]?.cards?.[itemKey]?.[field];
}

function fieldLabel(field) {
    return {
        kicker: 'Kicker',
        title: 'Titolo',
        subtitle: 'Sottotitolo',
        body: 'Testo',
        lead: 'Lead',
        chromaticBadge: 'Badge shiny',
        description: 'Descrizione',
    }[field] ?? field;
}

function updateSectionVisibility(section) {
    router.put(route('home-manager.sections.update', section.key), {
        is_visible: !section.is_visible,
    }, { preserveScroll: true });
}

function uploadImage(section) {
    const file = uploadInputs[section.key];

    if (!file) {
        return;
    }

    const data = new FormData();
    data.append('image', file);

    router.post(route('home-manager.images.upload', section.key), data, {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: () => {
            uploadInputs[section.key] = null;
        },
    });
}

function renameImage(section, file) {
    router.put(route('home-manager.images.rename', section.key), {
        path: file.path,
        new_filename: renameDrafts[`${section.key}:${file.path}`],
    }, { preserveScroll: true });
}

function selectImage(section, slot, path) {
    router.put(route('home-manager.images.select', section.key), {
        slot,
        path: path || null,
    }, { preserveScroll: true });
}

function updateText(section, locale, field, itemKey = null) {
    router.put(route('home-manager.texts.update', section.key), {
        locale,
        item_key: itemKey,
        field,
        value: textDrafts[textDraftKey(section.key, itemKey, locale, field)],
    }, { preserveScroll: true });
}

function storeCard(section) {
    router.post(route('home-manager.cards.store', section.key), newCardDrafts[section.key], {
        preserveScroll: true,
        onSuccess: () => {
            newCardDrafts[section.key] = {
                slug: '',
                image_path: section.pool?.[0]?.path ?? '',
                translation_key: '',
                sort_order: section.cards?.length ?? 0,
                is_active: true,
                is_chromatic: false,
            };
        },
    });
}

function updateCard(section, card) {
    router.put(route('home-manager.cards.update', [section.key, card.id]), cardDrafts[`${section.key}:${card.id}`], {
        preserveScroll: true,
    });
}

function destroyCard(section, card) {
    if (!confirm(`Eliminare ${card.slug}?`)) {
        return;
    }

    router.delete(route('home-manager.cards.destroy', [section.key, card.id]), {
        preserveScroll: true,
    });
}
</script>

<template>
    <AuthenticatedLayout>
        <Head title="Home manager" />

        <template #header>
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 class="text-2xl font-semibold leading-tight text-gray-900">Home manager</h1>
                    <p class="mt-1 text-sm text-gray-500">Sezioni, immagini, testi localizzati e card collegate al DB.</p>
                </div>
                <Link :href="route('home')" class="rounded bg-neutral-900 px-4 py-2 text-sm font-semibold text-white">Apri home</Link>
            </div>
        </template>

        <main class="px-4 py-8">
            <div class="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
                <aside class="self-start rounded-lg bg-white p-3 shadow">
                    <button
                        v-for="section in sections"
                        :key="section.key"
                        type="button"
                        class="mb-2 flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm font-semibold"
                        :class="selectedSection?.key === section.key ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'"
                        @click="selectedSectionKey = section.key"
                    >
                        <span>{{ section.label }}</span>
                        <span class="text-xs" :class="selectedSection?.key === section.key ? 'text-white/70' : 'text-neutral-400'">
                            {{ section.is_visible ? 'ON' : 'OFF' }}
                        </span>
                    </button>
                </aside>

                <section v-if="selectedSection" class="space-y-6">
                    <article class="rounded-lg bg-white p-5 shadow">
                        <div class="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p class="font-mono text-xs text-neutral-500">{{ selectedSection.key }}</p>
                                <h2 class="mt-1 text-2xl font-bold text-neutral-950">{{ selectedSection.label }}</h2>
                                <p class="mt-2 text-sm text-neutral-500">
                                    Pool: <span class="font-mono">{{ selectedSection.pool_directory || 'nessuna' }}</span>
                                    <span v-if="selectedSection.card_table"> · DB: <span class="font-mono">{{ selectedSection.card_table }}</span></span>
                                </p>
                            </div>
                            <button
                                type="button"
                                class="rounded px-4 py-2 text-sm font-semibold"
                                :class="selectedSection.is_visible ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
                                @click="updateSectionVisibility(selectedSection)"
                            >
                                {{ selectedSection.is_visible ? 'Nascondi sezione' : 'Mostra sezione' }}
                            </button>
                        </div>
                    </article>

                    <article class="rounded-lg bg-white p-5 shadow">
                        <h3 class="text-lg font-bold text-neutral-950">Testi sezione</h3>
                        <div class="mt-4 grid gap-5 md:grid-cols-2">
                            <div v-for="localeName in locales" :key="localeName" class="rounded border border-neutral-200 p-4">
                                <p class="mb-3 text-sm font-black uppercase text-neutral-500">{{ localeName }}</p>
                                <label v-for="field in selectedSection.text_fields" :key="field" class="mb-4 block">
                                    <span class="text-sm font-semibold text-neutral-700">{{ fieldLabel(field) }}</span>
                                    <textarea
                                        v-model="textDrafts[textDraftKey(selectedSection.key, null, localeName, field)]"
                                        rows="3"
                                        class="mt-1 w-full rounded border px-3 py-2 text-sm"
                                    ></textarea>
                                    <button type="button" class="mt-2 rounded bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white" @click="updateText(selectedSection, localeName, field)">
                                        Salva {{ fieldLabel(field) }}
                                    </button>
                                </label>
                            </div>
                        </div>
                    </article>

                    <article class="rounded-lg bg-white p-5 shadow">
                        <div class="flex flex-wrap items-center justify-between gap-3">
                            <h3 class="text-lg font-bold text-neutral-950">Pool immagini</h3>
                            <div class="flex items-center gap-2">
                                <input type="file" accept="image/*" class="text-sm" @input="uploadInputs[selectedSection.key] = $event.target.files[0]" />
                                <button type="button" class="rounded bg-neutral-900 px-3 py-2 text-xs font-semibold text-white" @click="uploadImage(selectedSection)">Aggiungi</button>
                            </div>
                        </div>
                        <div v-if="selectedSection.image_slots" class="mt-5 rounded border border-neutral-200 bg-neutral-50 p-4">
                            <h4 class="text-sm font-bold text-neutral-900">Immagini mostrate nelle card</h4>
                            <p class="mt-1 text-xs text-neutral-500">Assegna un'immagine della pool a ogni card. Le card senza immagine mantengono lo sfondo colorato.</p>
                            <div class="mt-4 grid gap-3 sm:grid-cols-2">
                                <label v-for="slot in selectedSection.image_slots" :key="slot" class="block text-sm font-semibold text-neutral-700">
                                    Card {{ slot }}
                                    <select
                                        :value="selectedSection.selected_images?.[slot - 1] ?? ''"
                                        class="mt-1 w-full rounded border px-2 py-2 text-sm"
                                        @change="selectImage(selectedSection, slot - 1, $event.target.value)"
                                    >
                                        <option value="">Sfondo colorato</option>
                                        <option v-for="file in selectedSection.pool" :key="file.path" :value="file.path">{{ file.filename }}</option>
                                    </select>
                                </label>
                            </div>
                        </div>
                        <div class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            <div v-for="file in selectedSection.pool" :key="file.path" class="rounded border border-neutral-200 p-3">
                                <img :src="file.path" :alt="file.filename" class="h-36 w-full rounded bg-neutral-100 object-contain" />
                                <p class="mt-2 truncate font-mono text-xs text-neutral-500">{{ file.path }}</p>
                                <div v-if="file.editable" class="mt-3 flex gap-2">
                                    <input v-model="renameDrafts[`${selectedSection.key}:${file.path}`]" class="min-w-0 flex-1 rounded border px-2 py-1 text-xs" />
                                    <button type="button" class="rounded bg-neutral-800 px-3 py-1 text-xs font-semibold text-white" @click="renameImage(selectedSection, file)">Rinomina</button>
                                </div>
                                <p v-else class="mt-3 text-xs text-neutral-400">Immagine inclusa nel sito</p>
                            </div>
                        </div>
                        <p v-if="!selectedSection.pool.length" class="mt-4 text-sm text-neutral-500">Nessuna immagine nella pool.</p>
                    </article>

                    <article v-if="selectedSection.card_table" :id="`${selectedSection.key}-cards`" class="rounded-lg bg-white p-5 shadow">
                        <h3 class="text-lg font-bold text-neutral-950">Card DB</h3>

                        <form class="mt-4 grid gap-3 rounded border border-neutral-200 bg-neutral-50 p-4 md:grid-cols-6" @submit.prevent="storeCard(selectedSection)">
                            <input v-model="newCardDrafts[selectedSection.key].slug" class="rounded border px-2 py-2 text-sm" placeholder="slug" />
                            <input v-model="newCardDrafts[selectedSection.key].translation_key" class="rounded border px-2 py-2 text-sm" placeholder="translationKey" />
                            <select v-model="newCardDrafts[selectedSection.key].image_path" class="rounded border px-2 py-2 text-sm md:col-span-2">
                                <option value="">Path immagine</option>
                                <option v-for="file in selectedSection.pool" :key="file.path" :value="file.path">{{ file.path }}</option>
                            </select>
                            <input v-model.number="newCardDrafts[selectedSection.key].sort_order" type="number" class="rounded border px-2 py-2 text-sm" placeholder="ordine" />
                            <button class="rounded bg-neutral-900 px-3 py-2 text-sm font-semibold text-white">Aggiungi card</button>
                        </form>

                        <div class="mt-5 space-y-5">
                            <div v-for="card in selectedSection.cards" :key="card.id" class="rounded border border-neutral-200 p-4">
                                <div class="grid gap-3 md:grid-cols-[110px_1fr]">
                                    <img :src="cardDrafts[`${selectedSection.key}:${card.id}`].image_path" :alt="card.slug" class="h-28 w-full rounded bg-neutral-100 object-contain" />
                                    <div class="grid gap-3 md:grid-cols-5">
                                        <input v-model="cardDrafts[`${selectedSection.key}:${card.id}`].slug" class="rounded border px-2 py-2 text-sm" />
                                        <input v-model="cardDrafts[`${selectedSection.key}:${card.id}`].translation_key" class="rounded border px-2 py-2 text-sm" />
                                        <select v-model="cardDrafts[`${selectedSection.key}:${card.id}`].image_path" class="rounded border px-2 py-2 text-sm md:col-span-2">
                                            <option v-for="file in selectedSection.pool" :key="file.path" :value="file.path">{{ file.path }}</option>
                                        </select>
                                        <input v-model.number="cardDrafts[`${selectedSection.key}:${card.id}`].sort_order" type="number" class="rounded border px-2 py-2 text-sm" />
                                        <label class="flex items-center gap-2 text-sm">
                                            <input v-model="cardDrafts[`${selectedSection.key}:${card.id}`].is_active" type="checkbox" />
                                            Attiva
                                        </label>
                                        <label v-if="selectedSection.key === 'polaroids'" class="flex items-center gap-2 text-sm">
                                            <input v-model="cardDrafts[`${selectedSection.key}:${card.id}`].is_chromatic" type="checkbox" />
                                            Shiny
                                        </label>
                                        <button type="button" class="rounded bg-neutral-900 px-3 py-2 text-sm font-semibold text-white" @click="updateCard(selectedSection, card)">
                                            Salva card
                                        </button>
                                        <button type="button" class="rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white" @click="destroyCard(selectedSection, card)">
                                            Elimina
                                        </button>
                                    </div>
                                </div>

                                <div class="mt-4 grid gap-4 md:grid-cols-2">
                                    <div v-for="localeName in locales" :key="localeName" class="rounded bg-neutral-50 p-3">
                                        <p class="mb-2 text-xs font-black uppercase text-neutral-500">{{ localeName }} · {{ cardDrafts[`${selectedSection.key}:${card.id}`].translation_key }}</p>
                                        <label class="mb-3 block">
                                            <span class="text-xs font-semibold text-neutral-600">Titolo</span>
                                            <input v-model="textDrafts[textDraftKey(selectedSection.key, card.translation_key, localeName, 'title')]" class="mt-1 w-full rounded border px-2 py-2 text-sm" />
                                            <button type="button" class="mt-2 rounded bg-neutral-800 px-3 py-1 text-xs font-semibold text-white" @click="updateText(selectedSection, localeName, 'title', card.translation_key)">
                                                Salva titolo
                                            </button>
                                        </label>
                                        <label class="block">
                                            <span class="text-xs font-semibold text-neutral-600">Descrizione</span>
                                            <textarea v-model="textDrafts[textDraftKey(selectedSection.key, card.translation_key, localeName, 'description')]" rows="3" class="mt-1 w-full rounded border px-2 py-2 text-sm"></textarea>
                                            <button type="button" class="mt-2 rounded bg-neutral-800 px-3 py-1 text-xs font-semibold text-white" @click="updateText(selectedSection, localeName, 'description', card.translation_key)">
                                                Salva descrizione
                                            </button>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>
                </section>
            </div>
        </main>
    </AuthenticatedLayout>
</template>
