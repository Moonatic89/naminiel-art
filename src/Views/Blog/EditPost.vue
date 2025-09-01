<template>

  <div v-if="isAuthed" class="pt-10 pb-20 px-4 bg-gray-200 min-h-screen">
    <div v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.4 } }" class="max-w-2xl mx-auto bg-white shadow p-6 rounded-2xl">
      <!-- Header -->
      <h2 class="text-2xl font-bold mb-2 text-gray-800">Dettagli Post</h2>

      <!-- Stato VISUALIZZAZIONE -->
      <div v-if="!editing && post">
        <h3 class="font-bold text-lg text-gray-800 mb-1">{{ post.title }}</h3>
        <p class="text-sm text-gray-600 mb-2">Categoria: {{ post.category }}</p>

        <img v-if="post.img" :src="post.img" alt="Immagine post" class="rounded-md max-h-40 object-cover border mb-2" />

        <div class="prose max-w-none text-sm" v-dompurify-html="post.text"></div>

        <div class="flex justify-end mt-6 gap-x-2">
          <button @click="showConfirm = true" class="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition">Rimuovi</button>
          <button @click="startEdit" class="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition">Modifica</button>
        </div>
      </div>

      <!-- Stato EDITING -->
      <div v-else-if="editing">
        <!-- Titolo -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Titolo</label>
          <input v-model="form.title" type="text" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400" />
        </div>

        <!-- Categoria -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <input v-model="form.category" type="text" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400" />
        </div>

        <!-- Corpo -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Testo</label>
          <textarea v-model="form.body" rows="6" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"></textarea>
        </div>

        <!-- Anteprima testo -->
        <div v-if="form.body" class="mb-6 p-3 bg-gray-100 border rounded-md prose max-w-none" v-dompurify-html="form.body"></div>

        <!-- Immagine -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Nuova immagine</label>
          <input type="file" accept="image/*" @change="onFileChange" class="w-full" />
          <div v-if="previewUrl" class="mt-3">
            <img :src="previewUrl" alt="Anteprima immagine" class="rounded-md max-h-40 object-cover border" />
          </div>
        </div>

        <!-- Bottoni -->
        <div class="flex justify-between">
          <button @click="cancelEdit" class="px-5 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-200 transition">Annulla</button>
          <button @click="submitEdit" :disabled="loading" class="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition">
            {{ loading ? "Salvataggio..." : "Salva Modifiche" }}
          </button>
        </div>

        <div v-if="successMessage" class="mt-4 text-green-600 font-medium text-center">
          {{ successMessage }}
        </div>
      </div>
    </div>

    <Modal :show="showConfirm" title="Conferma rimozione" message="Vuoi davvero eliminare questo post?" @cancel="showConfirm = false" @confirm="removePost" />
  </div>
</template>

<script setup>
import { useAuth } from "@/Composables/User/useAuth";
import { useBlog } from "@/stores/Blog/Blog";
import { computed, onMounted, ref } from "vue";
import Modal from "../../Components/Utilities/Modal.vue";

const { isAuthed } = useAuth();

const props = defineProps({
  id: { type: String, required: true },
});

const blog = useBlog();

// computed che filtra direttamente
const posts = computed(() => blog.posts);

const post = computed(() => {
  return posts.value.find((p) => p.id == props.id);
});

const editing = ref(false);
const form = ref({ title: "", category: "", body: "", image: null });
const previewUrl = ref(null);
const loading = ref(false);
const successMessage = ref("");

// se non ci sono post, li carico
onMounted(async () => {
  if (!blog.posts.length) {
    await blog.fetchPosts();
  }
});

function startEdit() {
  editing.value = true;
  form.value = {
    title: post.value.title,
    category: post.value.category,
    body: post.value.text,
    image: null,
  };
  previewUrl.value = post.value.img;
}

function cancelEdit() {
  editing.value = false;
  form.value = { title: "", category: "", body: "", image: null };
  previewUrl.value = null;
}

function onFileChange(e) {
  const file = e.target.files[0];
  if (file) {
    form.value.image = file;
    previewUrl.value = URL.createObjectURL(file);
  }
}

async function submitEdit() {
  loading.value = true;
  successMessage.value = "";
  try {
    await blog.updatePost(props.id, {
      title: form.value.title,
      category: form.value.category,
      body: form.value.body,
      imageFile: form.value.image,
    });

    successMessage.value = "Post aggiornato con successo!";
    editing.value = false;
  } catch (err) {
    alert("Errore durante l'aggiornamento");
    console.error(err);
  } finally {
    loading.value = false;
  }
}

// #region Modal

const showConfirm = ref(false);

const removePost = async () => {
  try {
    await blog.deletePost(props.id); // funzione che creiamo nello store
    showConfirm.value = false;
  } catch (err) {
    console.error("Errore durante la rimozione:", err);
  }
};
// #endregion
</script>
