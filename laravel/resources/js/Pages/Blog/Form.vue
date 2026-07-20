<script setup>
import { Head, Link, router, useForm } from '@inertiajs/vue3';
import PublicLayout from '@/Layouts/PublicLayout.vue';

const props = defineProps({
    post: Object,
});

const form = useForm({
    title: props.post?.title || '',
    category: props.post?.category || '',
    body: props.post?.body || '',
    image: null,
    image_fit: props.post?.image_fit || 'cover',
    image_position: props.post?.image_position || 'center',
    is_published: props.post?.is_published ?? true,
});

function submit() {
    if (props.post) {
        form.transform((data) => ({ ...data, _method: 'put' })).post(route('blog.update', props.post.id), {
            forceFormData: true,
        });
        return;
    }

    form.post(route('blog.store'), { forceFormData: true });
}

function destroyPost() {
    if (!props.post || !confirm('Eliminare questo post?')) {
        return;
    }

    router.delete(route('blog.destroy', props.post.id));
}
</script>

<template>
    <PublicLayout>
        <Head :title="post ? 'Modifica post' : 'Nuovo post'" />

        <main class="min-h-screen bg-neutral-100 px-4 py-10">
            <form class="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow" @submit.prevent="submit">
                <div class="flex items-center gap-3">
                    <Link :href="route('blog.index')" class="mr-auto text-sm font-semibold text-neutral-500">Torna al blog</Link>
                    <button v-if="post" type="button" class="rounded bg-red-600 px-3 py-1.5 text-sm font-semibold text-white" @click="destroyPost">
                        Elimina
                    </button>
                </div>
                <h1 class="mt-4 text-2xl font-bold text-neutral-950">{{ post ? 'Modifica post' : 'Nuovo post' }}</h1>

                <div class="mt-6 space-y-4">
                    <input v-model="form.title" class="w-full rounded border px-3 py-2" placeholder="Titolo" />
                    <p v-if="form.errors.title" class="text-sm text-red-600">{{ form.errors.title }}</p>

                    <input v-model="form.category" class="w-full rounded border px-3 py-2" placeholder="Categoria" />
                    <p v-if="form.errors.category" class="text-sm text-red-600">{{ form.errors.category }}</p>

                    <textarea v-model="form.body" rows="8" class="w-full rounded border px-3 py-2" placeholder="Testo HTML"></textarea>
                    <p v-if="form.errors.body" class="text-sm text-red-600">{{ form.errors.body }}</p>

                    <input type="file" accept="image/*" @input="form.image = $event.target.files[0]" />
                    <p v-if="form.errors.image" class="text-sm text-red-600">{{ form.errors.image }}</p>

                    <label class="flex items-center gap-2">
                        <input v-model="form.is_published" type="checkbox" />
                        <span>Pubblica</span>
                    </label>
                </div>

                <button class="mt-6 rounded bg-neutral-900 px-5 py-2 font-semibold text-white" :disabled="form.processing">
                    Salva
                </button>
            </form>
        </main>
    </PublicLayout>
</template>
