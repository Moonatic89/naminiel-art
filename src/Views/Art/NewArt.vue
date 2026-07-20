<template>
  <div class="min-h-screen bg-gray-100 py-10 px-4">
    <div class="max-w-4xl mx-auto">

      <!-- Header -->
      <h2 class="text-2xl font-bold text-gray-800 mb-1">Carica immagini</h2>
      <p class="text-sm text-gray-500 mb-6">Seleziona uno o più file. Compila i dettagli per ciascuno e pubblica tutto insieme.</p>

      <!-- Drop zone / file picker -->
      <div
        class="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors duration-200"
        :class="{ 'border-pink-400 bg-pink-50': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop.prevent="onDrop"
        @click="fileInputRef.click()"
      >
        <i class="fa-solid fa-cloud-arrow-up text-4xl text-gray-400 mb-3 block"></i>
        <p class="text-gray-600 font-medium">Clicca o trascina qui le immagini</p>
        <p class="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — nessun limite</p>
        <input ref="fileInputRef" type="file" accept="image/*" multiple class="hidden" @change="onFileChange" />
      </div>

      <!-- Queue -->
      <div v-if="queue.length" class="mt-8 space-y-4">

        <!-- Barra progresso globale -->
        <div v-if="isUploading" class="bg-white rounded-2xl shadow p-4">
          <div class="flex justify-between text-sm font-medium text-gray-600 mb-2">
            <span>Caricamento in corso...</span>
            <span>{{ doneCount }} / {{ queue.length }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div
              class="bg-pink-500 h-2.5 rounded-full transition-all duration-500"
              :style="{ width: progressPercent + '%' }"
            ></div>
          </div>
        </div>

        <!-- Card per ogni immagine in queue -->
        <div
          v-for="(item, idx) in queue"
          :key="item.id"
          class="bg-white rounded-2xl shadow overflow-hidden flex gap-0 transition-all duration-300"
          :class="{
            'opacity-60': item.status === 'done',
            'ring-2 ring-pink-400': item.status === 'uploading',
            'ring-2 ring-red-400': item.status === 'error',
            'ring-2 ring-green-400': item.status === 'done',
          }"
        >
          <!-- Preview -->
          <div class="w-36 h-36 flex-shrink-0 bg-gray-100">
            <img :src="item.previewUrl" :alt="item.title" class="w-full h-full object-cover" />
          </div>

          <!-- Form fields -->
          <div class="flex-1 p-4 flex flex-col gap-2">
            <div class="flex gap-2">
              <input
                v-model="item.title"
                type="text"
                placeholder="Titolo"
                :disabled="item.status === 'done' || item.status === 'uploading'"
                class="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:bg-gray-50 disabled:text-gray-400"
              />
              <input
                v-model="item.category"
                type="text"
                placeholder="Categoria"
                :disabled="item.status === 'done' || item.status === 'uploading'"
                class="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            <input
              v-model="item.description"
              type="text"
              placeholder="Descrizione (opzionale)"
              :disabled="item.status === 'done' || item.status === 'uploading'"
              class="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:bg-gray-50 disabled:text-gray-400"
            />

            <!-- Stato -->
            <div class="flex items-center gap-2 mt-auto">
              <span v-if="item.status === 'idle'" class="text-xs text-gray-400">In attesa</span>
              <span v-else-if="item.status === 'uploading'" class="text-xs text-pink-500 flex items-center gap-1">
                <i class="fa-solid fa-spinner fa-spin"></i> Caricamento...
              </span>
              <span v-else-if="item.status === 'done'" class="text-xs text-green-600 flex items-center gap-1">
                <i class="fa-solid fa-circle-check"></i> Pubblicata
              </span>
              <span v-else-if="item.status === 'error'" class="text-xs text-red-500 flex items-center gap-1">
                <i class="fa-solid fa-circle-xmark"></i> Errore — {{ item.errorMessage }}
              </span>
            </div>
          </div>

          <!-- Rimuovi dalla queue -->
          <button
            v-if="item.status === 'idle'"
            class="px-4 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
            title="Rimuovi"
            @click="removeFromQueue(idx)"
          >
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <!-- Azioni -->
        <div class="flex justify-between items-center pt-2">
          <button
            v-if="!isUploading && hasIdle"
            @click="resetIdle"
            class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <i class="fa-solid fa-rotate-left mr-1"></i> Svuota in attesa
          </button>
          <div class="ml-auto flex gap-3">
            <button
              v-if="!isUploading && hasIdle"
              @click="publishAll"
              class="px-6 py-2 bg-pink-500 text-white font-semibold rounded-xl hover:bg-pink-600 transition-colors shadow-md hover:shadow-lg"
            >
              <i class="fa-solid fa-rocket mr-2"></i> Pubblica tutto ({{ idleCount }})
            </button>
            <button
              v-if="!isUploading && allDoneOrError"
              @click="clearAll"
              class="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
            >
              Nuova sessione
            </button>
          </div>
        </div>

        <!-- Riepilogo finale -->
        <div
          v-if="allDoneOrError && !isUploading"
          class="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-700 flex items-center gap-3"
        >
          <i class="fa-solid fa-circle-check text-green-500 text-xl"></i>
          <span>
            Upload completato: <strong>{{ successCount }} pubblicat{{ successCount === 1 ? 'a' : 'e' }}</strong>
            <span v-if="errorCount"> · <strong class="text-red-500">{{ errorCount }} errore{{ errorCount > 1 ? 'i' : '' }}</strong></span>
          </span>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useArt } from "../../stores/Art/useArt";

const props = defineProps({
  namespace: { type: String, required: true },
});

const useArtStore = useArt(props.namespace);
const artStore = useArtStore();

// File input ref
const fileInputRef = ref(null);
const isDragging = ref(false);
const isUploading = ref(false);

// Queue: ogni item è { id, file, previewUrl, title, category, description, status, errorMessage }
const queue = ref([]);

let nextId = 0;

function buildItem(file) {
  const nameNoExt = file.name.replace(/\.[^.]+$/, "");
  return {
    id: nextId++,
    file,
    previewUrl: URL.createObjectURL(file),
    title: nameNoExt,
    category: "",
    description: "",
    status: "idle",   // idle | uploading | done | error
    errorMessage: "",
  };
}

function onFileChange(e) {
  const files = Array.from(e.target.files);
  files.forEach(f => queue.value.push(buildItem(f)));
  // Reset input per permettere la stessa selezione di nuovo
  e.target.value = "";
}

function onDrop(e) {
  isDragging.value = false;
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
  files.forEach(f => queue.value.push(buildItem(f)));
}

function removeFromQueue(idx) {
  const item = queue.value[idx];
  URL.revokeObjectURL(item.previewUrl);
  queue.value.splice(idx, 1);
}

// Contatori
const idleCount   = computed(() => queue.value.filter(i => i.status === "idle").length);
const doneCount   = computed(() => queue.value.filter(i => i.status === "done").length);
const errorCount  = computed(() => queue.value.filter(i => i.status === "error").length);
const successCount = computed(() => doneCount.value);
const hasIdle     = computed(() => idleCount.value > 0);
const allDoneOrError = computed(() => queue.value.length > 0 && queue.value.every(i => i.status === "done" || i.status === "error"));
const progressPercent = computed(() => {
  const finished = queue.value.filter(i => i.status === "done" || i.status === "error").length;
  return queue.value.length ? Math.round((finished / queue.value.length) * 100) : 0;
});

// Upload sequenziale
async function publishAll() {
  const idleItems = queue.value.filter(i => i.status === "idle");

  // Validazione
  for (const item of idleItems) {
    if (!item.title.trim()) {
      alert(`Inserisci un titolo per "${item.file.name}"`);
      return;
    }
    if (!item.category.trim()) {
      alert(`Inserisci una categoria per "${item.title}"`);
      return;
    }
  }

  isUploading.value = true;

  for (const item of idleItems) {
    item.status = "uploading";
    try {
      await artStore.addArt({
        title: item.title.trim(),
        category: item.category.trim(),
        description: item.description.trim(),
        imageFile: item.file,
        is_published: item.is_published !== false,
      });
      item.status = "done";
    } catch (err) {
      item.status = "error";
      item.errorMessage = err?.message ?? "Errore sconosciuto";
    }
  }

  isUploading.value = false;
}

function resetIdle() {
  const remaining = queue.value.filter(i => i.status !== "idle");
  // Revoca URL degli item idle
  queue.value.filter(i => i.status === "idle").forEach(i => URL.revokeObjectURL(i.previewUrl));
  queue.value = remaining;
}

function clearAll() {
  queue.value.forEach(i => URL.revokeObjectURL(i.previewUrl));
  queue.value = [];
}
</script>
