<script setup>
import { Head, useForm } from '@inertiajs/vue3';
import PublicLayout from '@/Layouts/PublicLayout.vue';

const form = useForm({
    name: '',
    email: '',
    type: 'Half Body',
    description: '',
});

function submit() {
    form.post(route('commission.store'), {
        preserveScroll: true,
        onSuccess: () => form.reset(),
    });
}
</script>

<template>
    <PublicLayout>
        <Head title="Commissioni" />

        <main class="min-h-screen bg-neutral-100 px-4 py-10">
            <div class="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <section class="rounded-xl bg-white p-6 shadow">
                <h1 class="text-3xl font-bold text-neutral-950">Commissioni aperte</h1>
                <div class="mt-6 space-y-3 text-sm text-neutral-700">
                    <div class="flex justify-between border-b pb-2"><span>Icon / Busto</span><strong>da 25 EUR</strong></div>
                    <div class="flex justify-between border-b pb-2"><span>Half Body</span><strong>da 40 EUR</strong></div>
                    <div class="flex justify-between border-b pb-2"><span>Full Body</span><strong>da 60 EUR</strong></div>
                    <div class="flex justify-between border-b pb-2"><span>Sfondo dettagliato</span><strong>+ 15-30 EUR</strong></div>
                </div>
                </section>

                <form class="rounded-xl bg-white p-6 shadow" @submit.prevent="submit">
                <h2 class="text-2xl font-bold text-neutral-950">Richiedi preventivo</h2>
                <p v-if="$page.props.flash.success" class="mt-4 rounded bg-green-100 px-3 py-2 text-sm text-green-800">
                    {{ $page.props.flash.success }}
                </p>

                <div class="mt-6 space-y-4">
                    <input v-model="form.name" class="w-full rounded border px-3 py-2" placeholder="Nome / nickname" />
                    <p v-if="form.errors.name" class="text-sm text-red-600">{{ form.errors.name }}</p>

                    <input v-model="form.email" type="email" class="w-full rounded border px-3 py-2" placeholder="Email" />
                    <p v-if="form.errors.email" class="text-sm text-red-600">{{ form.errors.email }}</p>

                    <select v-model="form.type" class="w-full rounded border px-3 py-2">
                        <option>Icon / Busto</option>
                        <option>Half Body</option>
                        <option>Full Body</option>
                        <option>Altro</option>
                    </select>

                    <textarea v-model="form.description" rows="6" class="w-full rounded border px-3 py-2" placeholder="Descrivi idea, posa, mood e reference"></textarea>
                    <p v-if="form.errors.description" class="text-sm text-red-600">{{ form.errors.description }}</p>
                </div>

                <button class="mt-6 w-full rounded bg-neutral-900 px-5 py-2 font-semibold text-white" :disabled="form.processing">
                    Invia richiesta
                </button>
                </form>
            </div>
        </main>
    </PublicLayout>
</template>
