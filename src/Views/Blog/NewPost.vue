<template>
  <div class="pt-10 pb-20 px-4 bg-gray-200 min-h-screen">
    <!-- Container principale -->
    <div
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 0.4 } }"
      class="max-w-2xl mx-auto bg-white shadow p-6 rounded-2xl"
    >
      <h2
        v-motion
        :initial="{ opacity: 0, y: -10 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.4 } }"
        class="text-2xl font-bold mb-6 text-gray-800"
      >
        Crea un nuovo post
      </h2>

      <!-- Titolo -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 10 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.3 } }"
        class="mb-4"
      >
        <label class="block text-sm font-medium text-gray-700 mb-1">Titolo</label>
        <input
          v-model="form.title"
          type="text"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
          placeholder="Inserisci titolo"
        />
      </div>

      <!-- Categoria -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 10 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.3 } }"
        class="mb-4"
      >
        <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
        <input
          v-model="form.category"
          type="text"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
          placeholder="Es. Erranti Celesti"
        />
      </div>

      <!-- Corpo -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 10 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.3 } }"
        class="mb-4"
      >
        <label class="block text-sm font-medium text-gray-700 mb-1">Testo (HTML formattato)</label>
        <textarea
          v-model="form.body"
          rows="6"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
          placeholder="Incolla qui l'HTML formattato dall'AI..."
        ></textarea>
      </div>

      <!-- Anteprima -->
      <div
        v-if="form.body"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { delay: 0.5, duration: 0.3 } }"
        class="mb-6 p-3 bg-gray-100 border rounded-md prose max-w-none"
        v-dompurify-html="form.body"
      ></div>

      <!-- Immagine -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 10 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.3 } }"
        class="mb-6"
      >
        <label class="block text-sm font-medium text-gray-700 mb-1">Immagine</label>
        <input type="file" accept="image/*" @change="onFileChange" class="w-full" />
        <div
          v-if="previewUrl"
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :enter="{
            opacity: 1,
            scale: 1,
            transition: { type: 'spring', stiffness: 200, damping: 20 }
          }"
          class="mt-3"
        >
          <img
            :src="previewUrl"
            alt="Anteprima immagine"
            class="rounded-md max-h-40 object-cover border"
          />
        </div>
      </div>

      <!-- Bottone invio -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 10 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.3 } }"
        class="flex justify-end"
      >
        <button
          @click="submitPost"
          :disabled="loading"
          class="px-5 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition transform hover:scale-105"
        >
          {{ loading ? "Caricamento..." : "Pubblica Post" }}
        </button>
      </div>

      <!-- Messaggio successo -->
      <div
        v-if="successMessage"
        v-motion
        :initial="{ opacity: 0, scale: 0.8 }"
        :enter="{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 250, damping: 15 } }"
        class="mt-4 text-green-600 font-medium text-center"
      >
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBlog } from "@/stores/Blog/Blog";
import { ref } from "vue";

const blog = useBlog();

// Stato form
const form = ref({
  title: "Nuovo Post",
  category: "TEST",
  body: "<p class='text-rose-500 font-bold'>Testo di esempio formattato</p>",
  image: null,
});

const previewUrl = ref(null);
const loading = ref(false);
const successMessage = ref("");

// Funzione caricamento file
function onFileChange(e) {
  const file = e.target.files[0];
  if (file) {
    form.value.image = file;
    previewUrl.value = URL.createObjectURL(file);
  }
}

// Submit
async function submitPost() {
  if (!form.value.title || !form.value.category || !form.value.body || !form.value.image) {
    alert("Compila tutti i campi");
    return;
  }

  loading.value = true;
  successMessage.value = "";

  try {
    await blog.addPost({
      title: form.value.title,
      category: form.value.category,
      body: form.value.body,
      imageFile: form.value.image,
    });

    successMessage.value = "Post creato con successo!";
    // Reset form
    form.value = { title: "", category: "", body: "", image: null };
    previewUrl.value = null;
  } catch (err) {
    alert("Errore durante la creazione del post");
    console.error(err);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped></style>
