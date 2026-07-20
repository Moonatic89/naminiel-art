<script setup>
import { Head, Link } from '@inertiajs/vue3';
import PublicLayout from '@/Layouts/PublicLayout.vue';
</script>

<template>
    <PublicLayout>
        <Head title="Privacy e Cookie Policy" />

        <main class="min-h-screen bg-white px-4 py-12">
            <article class="mx-auto max-w-3xl space-y-7 text-neutral-800">
                <Link :href="route('home')" class="text-sm font-semibold text-neutral-500">Torna alla home</Link>
                <h1 class="text-4xl font-black text-neutral-950">Privacy e Cookie Policy</h1>

                <section>
                    <h2 class="mb-2 text-xl font-bold">1. Finalita del sito</h2>
                    <p>Questo sito e un portfolio personale e una vetrina artistica. Puoi navigare tra i contenuti e contattare l'artista tramite il modulo commissioni.</p>
                </section>

                <section>
                    <h2 class="mb-2 text-xl font-bold">2. Dati raccolti</h2>
                    <ul class="list-inside list-disc space-y-1">
                        <li>Dati tecnici minimi possono essere gestiti dai sistemi di hosting.</li>
                        <li>Quando invii una richiesta commissione, nome, email e messaggio vengono usati solo per rispondere.</li>
                    </ul>
                </section>

                <section>
                    <h2 class="mb-2 text-xl font-bold">3. Cookie</h2>
                    <p>Il sito usa cookie tecnici necessari al funzionamento dell'applicazione. Non usa cookie di profilazione o marketing.</p>
                </section>

                <section>
                    <h2 class="mb-2 text-xl font-bold">4. Conservazione dei dati</h2>
                    <p>Le richieste inviate dal modulo vengono conservate solo per gestire la conversazione e non vengono cedute a terzi.</p>
                </section>

                <section>
                    <h2 class="mb-2 text-xl font-bold">5. Diritti</h2>
                    <p>Puoi richiedere informazioni, rettifica o cancellazione dei tuoi dati scrivendo all'artista dai contatti indicati nella pagina About.</p>
                </section>
            </article>
        </main>
    </PublicLayout>
</template>
