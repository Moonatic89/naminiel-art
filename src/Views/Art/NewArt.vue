<template>
  <div class="p-6 bg-white shadow rounded-xl w-full max-w-4xl mx-auto">
    <!-- Form -->
    <h2 class="text-xl font-semibold mb-4">Carica nuova immagine</h2>

    <div class="space-y-3">
      <!-- Titolo -->
      <input v-model="title" type="text" placeholder="Titolo" class="w-full border rounded-lg p-2" />

      <!-- Categoria -->
      <input v-model="category" type="text" placeholder="Categoria" class="w-full border rounded-lg p-2" />

      <!-- Descrizione -->
      <input v-model="description" type="text" placeholder="Descrizione" class="w-full border rounded-lg p-2" />

      <!-- File upload -->
      <input type="file" accept="image/*" @change="onFileChange" class="w-full" />

      <!-- Preview -->
      <div v-if="preview" class="mt-3">
        <img :src="preview" class="max-h-48 rounded-lg shadow" />
      </div>
    </div>

    <!-- Bottoni -->
    <div class="flex gap-3 mt-4">
      <button @click="submit" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Carica</button>
      <button @click="reset" class="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400">Reset</button>
    </div>

    <!-- Messaggi -->
    <div v-if="message" class="mt-4 p-2 rounded text-white" :class="messageColor">
      {{ message }}
    </div>

    <!-- Galleria -->
    <h3 class="text-lg font-semibold mt-8 mb-3">Immagini caricate</h3>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="(art, idx) in artStore.arts" :key="idx" class="relative cursor-pointer group" @click="openModal(art)">
        <!-- Immagine con orientamento -->
        <img :src="art.img || art.image" :alt="art.title" class="w-full h-32 object-cover rounded-lg shadow" :class="orientationClasses[orientationStore[art.id] || 'center']" />

        <!-- Bottone orientamento -->
        <button class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded hidden group-hover:block" @click.stop="openOrientationModal(art)">Orienta</button>
      </div>
    </div>

    <!-- Modal orientamento -->
    <div v-if="showOrientationModal" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" @click.self="closeOrientationModal">
      <div class="bg-white p-4 rounded-lg shadow-lg max-w-sm w-full">
        <h3 class="text-lg font-semibold mb-3">Seleziona orientamento</h3>

        <div class="grid grid-cols-3 gap-2">
          <button v-for="opt in orientationOptions" :key="opt.value" @click="selectedOrientation = opt.value" :class="['border rounded p-2 text-center', selectedOrientation === opt.value ? 'bg-green-200 border-green-500' : 'bg-gray-100 hover:bg-gray-200']">
            {{ opt.label }}
          </button>
        </div>

        <div class="flex justify-end mt-4 gap-2">
          <button class="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400" @click="closeOrientationModal">Annulla</button>
          <button class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700" @click="confirmOrientation">Conferma</button>
        </div>
      </div>
    </div>

    <!-- Modal immagine -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" @click.self="closeModal">
      <div class="bg-white p-4 rounded-lg shadow-lg max-w-2xl">
        <img :src="selectedArt.img || selectedArt.image" :alt="selectedArt.title" class="max-h-[70vh] mx-auto rounded" />
        <p class="mt-2 text-center font-semibold">{{ selectedArt.title }}</p>
        <p class="text-center text-gray-600">{{ selectedArt.category }}</p>
        <button @click="closeModal" class="mt-3 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mx-auto block">Chiudi</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLocalStorage } from "@vueuse/core";
import { onMounted, ref } from "vue";
import { useArt } from "../../stores/Art/useArt";

const props = defineProps({
  namespace: { type: String, required: true },
});

const useArtStore = useArt(props.namespace);
const artStore = useArtStore();

const title = ref("");
const category = ref("");
const description = ref("");
const file = ref(null);
const preview = ref(null);
const message = ref("");
const messageColor = ref("");

// Modal
const showModal = ref(false);
const selectedArt = ref({});

// Store

onMounted(() => {
  artStore.fetchArts();
});

function onFileChange(e) {
  const f = e.target.files[0];
  if (f) {
    file.value = f;
    preview.value = URL.createObjectURL(f);
  }
}

function reset() {
  title.value = "";
  category.value = "";
  description.value = "";
  file.value = null;
  preview.value = null;
  message.value = "";
}

const submit = async () => {
  await artStore.addArt({
    title: title.value,
    category: category.value,
    description: description.value,
    imageFile: file.value,
  });
};

function openModal(art) {
  selectedArt.value = art;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedArt.value = {};
}

// #region Orientamento
const showOrientationModal = ref(false);
const selectedOrientation = ref("center");

// opzioni disponibili
const orientationOptions = [
  { value: "center", label: "Centro" },
  { value: "top", label: "Alto" },
  { value: "bottom", label: "Basso" },
  { value: "left", label: "Sinistra" },
  { value: "right", label: "Destra" },
  { value: "top-left", label: "Alto SX" },
  { value: "top-right", label: "Alto DX" },
  { value: "bottom-left", label: "Basso SX" },
  { value: "bottom-right", label: "Basso DX" },
];

// mappa classi per object-position di Tailwind
const orientationClasses = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
  "top-left": "object-left-top",
  "top-right": "object-right-top",
  "bottom-left": "object-left-bottom",
  "bottom-right": "object-right-bottom",
};

// localstorage per memorizzare orientamento per ID immagine
const orientationStore = useLocalStorage("imageOrientation", {}); // { id: "top", ... }

function openOrientationModal(art) {
  selectedArt.value = art;
  selectedOrientation.value = orientationStore.value[art.id] || "center";
  showOrientationModal.value = true;
}

function closeOrientationModal() {
  showOrientationModal.value = false;
  selectedArt.value = null;
}

function confirmOrientation() {
  if (selectedArt.value) {
    orientationStore.value[selectedArt.value.id] = selectedOrientation.value;
  }
  closeOrientationModal();
} // #endregion
</script>
