<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, router, useForm } from '@inertiajs/vue3';
import { computed, ref } from 'vue';

const props = defineProps({
    cards: {
        type: Array,
        default: () => [],
    },
});

const editingId = ref(null);

const emptyCard = {
    code: '',
    slug: '',
    translation_key: '',
    title: '',
    body_html: '',
    image_path: '/media/qr-code-cards/images/',
    is_active: true,
};

const form = useForm({ ...emptyCard });

const currentCard = computed(() => props.cards.find((card) => card.id === editingId.value));

function editCard(card) {
    editingId.value = card.id;
    form.clearErrors();
    form.defaults({
        code: card.code,
        slug: card.slug,
        translation_key: card.translation_key,
        title: card.title,
        body_html: card.body_html,
        image_path: card.image_path,
        is_active: card.is_active,
    });
    form.reset();
}

function newCard() {
    editingId.value = null;
    form.clearErrors();
    form.defaults({ ...emptyCard });
    form.reset();
}

function submit() {
    if (editingId.value) {
        form.put(route('qr-cards.update', editingId.value), { preserveScroll: true });
        return;
    }

    form.post(route('qr-cards.store'), {
        preserveScroll: true,
        onSuccess: () => newCard(),
    });
}

function deleteCard(card) {
    if (!confirm(`Eliminare la card QR "${card.title}"?`)) {
        return;
    }

    router.delete(route('qr-cards.destroy', card.id), {
        preserveScroll: true,
        onSuccess: () => {
            if (editingId.value === card.id) {
                newCard();
            }
        },
    });
}
</script>

<template>
    <AuthenticatedLayout>
        <Head title="QR code cards" />

        <template #header>
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 class="text-2xl font-semibold leading-tight text-gray-900">QR code cards</h1>
                    <p class="mt-1 text-sm text-gray-500">Gestione endpoint pubblici e conteggio visite.</p>
                </div>
                <button type="button" class="rounded bg-neutral-900 px-4 py-2 text-sm font-semibold text-white" @click="newCard">
                    Nuova card
                </button>
            </div>
        </template>

        <main class="px-4 py-8">
            <div class="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_420px]">
                <section class="overflow-hidden rounded-lg bg-white shadow">
                    <div class="grid grid-cols-[88px_1fr] gap-4 border-b border-neutral-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 md:grid-cols-[96px_1fr_160px_128px]">
                        <span>Img</span>
                        <span>Card</span>
                        <span class="hidden md:block">Visite</span>
                        <span class="hidden md:block">Stato</span>
                    </div>

                    <article
                        v-for="card in cards"
                        :key="card.id"
                        class="grid grid-cols-[88px_1fr] gap-4 border-b border-neutral-100 px-4 py-4 last:border-0 md:grid-cols-[96px_1fr_160px_128px]"
                    >
                        <img class="h-20 w-20 rounded object-cover" :src="card.image_path" :alt="card.title" />

                        <div class="min-w-0">
                            <h2 class="truncate text-base font-bold text-neutral-950">{{ card.title }}</h2>
                            <p class="mt-1 font-mono text-xs text-neutral-500">/cards/{{ card.code }}</p>
                            <p class="mt-1 font-mono text-xs text-neutral-400">i18n: {{ card.translation_key }}</p>
                            <div class="mt-3 flex flex-wrap gap-2">
                                <Link class="rounded border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700" :href="card.public_url">
                                    Apri
                                </Link>
                                <button type="button" class="rounded bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white" @click="editCard(card)">
                                    Modifica
                                </button>
                                <button type="button" class="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white" @click="deleteCard(card)">
                                    Elimina
                                </button>
                            </div>
                        </div>

                        <div class="text-sm text-neutral-700">
                            <strong class="block text-lg text-neutral-950">{{ card.visits_count }}</strong>
                            <span class="text-xs text-neutral-500">{{ card.last_visited_at || 'Mai visitata' }}</span>
                        </div>

                        <div>
                            <span
                                class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                                :class="card.is_active ? 'bg-green-100 text-green-800' : 'bg-neutral-200 text-neutral-700'"
                            >
                                {{ card.is_active ? 'Attiva' : 'Nascosta' }}
                            </span>
                        </div>
                    </article>
                </section>

                <aside class="rounded-lg bg-white p-5 shadow">
                    <h2 class="text-lg font-bold text-neutral-950">{{ currentCard ? 'Modifica card' : 'Nuova card' }}</h2>
                    <form class="mt-5 space-y-4" @submit.prevent="submit">
                        <label class="block">
                            <span class="text-sm font-semibold text-neutral-700">Codice endpoint</span>
                            <input v-model="form.code" class="mt-1 w-full rounded border px-3 py-2 font-mono text-sm" placeholder="U2IincCURYHF6yxf" />
                            <p v-if="form.errors.code" class="mt-1 text-sm text-red-600">{{ form.errors.code }}</p>
                        </label>

                        <label class="block">
                            <span class="text-sm font-semibold text-neutral-700">Slug interno</span>
                            <input v-model="form.slug" class="mt-1 w-full rounded border px-3 py-2 text-sm" placeholder="lauro" />
                            <p v-if="form.errors.slug" class="mt-1 text-sm text-red-600">{{ form.errors.slug }}</p>
                        </label>

                        <label class="block">
                            <span class="text-sm font-semibold text-neutral-700">Chiave traduzione</span>
                            <input v-model="form.translation_key" class="mt-1 w-full rounded border px-3 py-2 font-mono text-sm" placeholder="lauro" />
                            <p v-if="form.errors.translation_key" class="mt-1 text-sm text-red-600">{{ form.errors.translation_key }}</p>
                        </label>

                        <label class="block">
                            <span class="text-sm font-semibold text-neutral-700">Titolo</span>
                            <input v-model="form.title" class="mt-1 w-full rounded border px-3 py-2 text-sm" placeholder="Titolo card" />
                            <p v-if="form.errors.title" class="mt-1 text-sm text-red-600">{{ form.errors.title }}</p>
                        </label>

                        <label class="block">
                            <span class="text-sm font-semibold text-neutral-700">Path immagine</span>
                            <input v-model="form.image_path" class="mt-1 w-full rounded border px-3 py-2 text-sm" placeholder="/media/qr-code-cards/images/lauro.webp" />
                            <p v-if="form.errors.image_path" class="mt-1 text-sm text-red-600">{{ form.errors.image_path }}</p>
                        </label>

                        <label class="block">
                            <span class="text-sm font-semibold text-neutral-700">HTML pagina (italiano)</span>
                            <textarea v-model="form.body_html" rows="14" class="mt-1 w-full rounded border px-3 py-2 font-mono text-xs"></textarea>
                            <p v-if="form.errors.body_html" class="mt-1 text-sm text-red-600">{{ form.errors.body_html }}</p>
                        </label>

                        <label class="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                            <input v-model="form.is_active" type="checkbox" />
                            Pubblica
                        </label>

                        <button class="w-full rounded bg-neutral-900 px-4 py-2 font-semibold text-white" :disabled="form.processing">
                            Salva
                        </button>
                    </form>
                </aside>
            </div>
        </main>
    </AuthenticatedLayout>
</template>
