<template>

  <div v-if="isAuthed" class="pt-10 pb-20 px-4 bg-gray-200 min-h-screen">
    <div v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.4 } }" class="max-w-2xl mx-auto bg-white shadow p-6 rounded-2xl">
      <!-- Back -->
      <router-link
        to="/blog"
        class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Torna al blog
      </router-link>

      <!-- Header -->
      <h2 class="text-2xl font-bold mb-2 text-gray-800">Dettagli Post</h2>

      <!-- Stato VISUALIZZAZIONE -->
      <div v-if="!editing && post">
        <div class="flex items-center gap-2 mb-1">
          <h3 class="font-bold text-lg text-gray-800">{{ post.title }}</h3>
          <span 
            class="px-2 py-0.5 rounded text-xs font-semibold"
            :class="post.is_published === false ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'"
          >
            {{ post.is_published === false ? 'Bozza' : 'Pubblicato' }}
          </span>
        </div>
        <p class="text-sm text-gray-600 mb-2">Categoria: {{ post.category }}</p>

        <div v-if="post.img" class="relative rounded-md overflow-hidden border mb-2 bg-gray-100" style="height: 160px">
          <img :src="post.img" alt="Immagine post" class="w-full h-full"
            :style="{ objectFit: post.img_fit || 'cover', objectPosition: post.img_position || 'center' }" />
        </div>

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

        <!-- Stato Pubblicazione -->
        <label class="flex items-center gap-2 mb-4 bg-gray-50 p-3 rounded-lg border cursor-pointer hover:bg-gray-100 transition">
          <input v-model="form.is_published" type="checkbox" class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer" />
          <span class="text-sm font-medium text-gray-700 select-none">Pubblica questo post (se disattivato, resterà in Bozza)</span>
        </label>

        <!-- Immagine -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Nuova immagine</label>
          <input type="file" accept="image/*" @change="onFileChange" class="w-full" />
          <div v-if="previewUrl" class="mt-3 rounded-md overflow-hidden border bg-gray-100" style="height: 160px">
            <img :src="previewUrl" alt="Anteprima immagine" class="w-full h-full"
              :style="{ objectFit: form.img_fit, objectPosition: form.img_position }" />
          </div>
          <!-- Picker display mode -->
          <ImageDisplayPicker
            v-model:fit="form.img_fit"
            v-model:position="form.img_position"
            :preview-src="previewUrl"
          />
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
import ImageDisplayPicker from "../../Components/Utilities/ImageDisplayPicker.vue";
import { useRouter } from "vue-router";

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
const form = ref({ title: "", category: "", body: "", image: null, img_fit: "cover", img_position: "center", is_published: true });
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
    img_fit: post.value.img_fit || 'cover',
    img_position: post.value.img_position || 'center',
    is_published: post.value.is_published !== false,
  };
  previewUrl.value = post.value.img;
}

function cancelEdit() {
  editing.value = false;
  form.value = { title: "", category: "", body: "", image: null, is_published: true };
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
      img_fit: form.value.img_fit,
      img_position: form.value.img_position,
      is_published: form.value.is_published,
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

const router = useRouter();

// #region Modal

const showConfirm = ref(false);

const removePost = async () => {
  try {
    await blog.deletePost(props.id);
    showConfirm.value = false;
    router.push('/blog');
  } catch (err) {
    console.error("Errore durante la rimozione:", err);
  }
};
// #endregion
</script>
