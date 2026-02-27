<template>
  <div class="p-6 bg-white shadow rounded-xl w-full max-w-4xl mx-auto">
    <!-- Back -->
    <router-link
      :to="`/art-${props.namespace}`"
      class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      Torna alla lista
    </router-link>

    <!-- Header -->
    <h2 class="text-xl font-semibold mb-4">Dettagli Immagine</h2>

    <!-- Stato VISUALIZZAZIONE -->
    <div v-if="!editing && art">
      <h3 class="font-bold text-lg text-gray-800 mb-1">{{ art.title }}</h3>
      <p class="text-sm text-gray-600 mb-2">Categoria: {{ art.category }}</p>
      <p class="text-sm text-gray-500 mb-4">{{ art.description }}</p>

      <div v-if="art.img" class="relative rounded-md overflow-hidden border mb-3 bg-gray-100" style="height: 192px">
        <img :src="art.img" :alt="art.title" class="w-full h-full"
          :style="{ objectFit: art.img_fit || 'cover', objectPosition: art.img_position || 'center' }" />
      </div>

      <div class="flex justify-end gap-2">
        <button @click="showConfirm = true" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">Rimuovi</button>
        <button @click="startEdit" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Modifica</button>
      </div>
    </div>

    <!-- Stato EDITING -->
    <div v-else-if="editing">
      <!-- Titolo -->
      <input v-model="form.title" type="text" placeholder="Titolo" class="w-full border rounded-lg p-2 mb-3" />

      <!-- Categoria -->
      <input v-model="form.category" type="text" placeholder="Categoria" class="w-full border rounded-lg p-2 mb-3" />

      <!-- Descrizione -->
      <input v-model="form.description" type="text" placeholder="Descrizione" class="w-full border rounded-lg p-2 mb-3" />

      <!-- Immagine -->
      <label class="block text-sm font-medium text-gray-700 mb-1">Nuova immagine</label>
      <input type="file" accept="image/*" @change="onFileChange" class="w-full" />

      <div v-if="previewUrl" class="mt-3 rounded-lg overflow-hidden border bg-gray-100" style="height: 192px">
        <img :src="previewUrl" alt="Anteprima" class="w-full h-full"
          :style="{ objectFit: form.img_fit, objectPosition: form.img_position }" />
      </div>

      <!-- Picker display mode -->
      <ImageDisplayPicker
        v-model:fit="form.img_fit"
        v-model:position="form.img_position"
        :preview-src="previewUrl"
      />

      <!-- Bottoni -->
      <div class="flex justify-between mt-5">
        <button @click="cancelEdit" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition">Annulla</button>
        <button @click="submitEdit" :disabled="loading" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
          {{ loading ? "Salvataggio..." : "Salva Modifiche" }}
        </button>
      </div>

      <div v-if="successMessage" class="mt-4 text-green-600 font-medium text-center">
        {{ successMessage }}
      </div>
    </div>

    <!-- Modal conferma -->
    <div v-if="showConfirm" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" @click.self="showConfirm = false">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h3 class="text-lg font-semibold mb-4">Conferma rimozione</h3>
        <p class="mb-6">Vuoi davvero eliminare questa immagine?</p>
        <div class="flex justify-end gap-3">
          <button class="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400" @click="showConfirm = false">Annulla</button>
          <button class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700" @click="removeArt">Conferma</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useArt } from "../../stores/Art/useArt";
import { useRouter } from "vue-router";
import ImageDisplayPicker from "../../Components/Utilities/ImageDisplayPicker.vue";

const props = defineProps({
  id: { type: String, required: true },
  namespace: { type: String, required: true },
});

const useArtStore = useArt(props.namespace);
const artStore = useArtStore();

const arts = computed(() => artStore.arts);
const art = computed(() => arts.value.find((a) => a.id == props.id));

const editing = ref(false);
const form = ref({ title: "", category: "", description: "", image: null, img_fit: "cover", img_position: "center" });
const previewUrl = ref(null);
const loading = ref(false);
const successMessage = ref("");

// carico se mancano
onMounted(async () => {
  if (!arts.value.length) {
    await artStore.fetchArts();
  }
});

function startEdit() {
  editing.value = true;
  form.value = {
    title: art.value.title,
    category: art.value.category,
    description: art.value.description,
    image: null,
    img_fit: art.value.img_fit || 'cover',
    img_position: art.value.img_position || 'center',
  };
  previewUrl.value = art.value.img;
}

function cancelEdit() {
  editing.value = false;
  form.value = { title: "", category: "", description: "", image: null };
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
    await artStore.updateArt(props.id, {
      title: form.value.title,
      category: form.value.category,
      description: form.value.description,
      imageFile: form.value.image,
      img_fit: form.value.img_fit,
      img_position: form.value.img_position,
    });

    successMessage.value = "Immagine aggiornata con successo!";
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

const removeArt = async () => {
  try {
    await artStore.removeArt(props.id, art.value.fileName);
    showConfirm.value = false;
    router.push(`/art-${props.namespace}`);
  } catch (err) {
    console.error("Errore durante la rimozione:", err);
  }
};
// #endregion
</script>
