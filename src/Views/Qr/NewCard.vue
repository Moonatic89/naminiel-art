<template>
  <div class="p-6 bg-white shadow rounded-xl w-full max-w-4xl mx-auto">
    <!-- Form -->
    <h2 class="text-xl font-semibold mb-4">Carica nuovo contenuto</h2>

    <div class="space-y-3">
      <!-- Titolo -->
      <input v-model="title" type="text" placeholder="Titolo" class="w-full border rounded-lg p-2" />

      <!-- Testo -->
      <textarea v-model="text" placeholder="Testo" rows="4" class="w-full border rounded-lg p-2"></textarea>

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

    <!-- Lista risorse -->
    <h3 class="text-lg font-semibold mt-8 mb-3">Risorse salvate</h3>
    <div v-if="resources.length === 0" class="text-gray-500">Nessuna risorsa disponibile</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="r in resources" :key="r.id" class="border rounded-lg p-3 shadow cursor-pointer" @click="openModal(r)">
        <p class="font-semibold">{{ r.title }}</p>
        <p class="text-xs text-gray-400 mt-1">Code: {{ r.code }}</p>
        <img v-if="r.image" :src="r.image" class="w-full h-32 object-cover rounded mt-2" />
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" @click.self="closeModal">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl h-[80vh] flex flex-col">
        <!-- Immagine in alto -->
        <div class="flex-shrink-0">
          <img :src="selectedResource.image" :alt="selectedResource.title" class="w-full max-h-80 object-contain rounded-t-lg" />
        </div>

        <!-- Contenuto scrollabile -->
        <div class="flex-1 overflow-y-auto p-4">
          <p class="mt-2 text-center font-semibold">{{ selectedResource.title }}</p>
          <p class="text-center text-gray-600 mt-2" v-dompurify-html="selectedResource.text"></p>
          <p class="text-center text-gray-400 text-sm mt-2">Code: {{ selectedResource.code }}</p>
        </div>

        <!-- Footer con bottone -->
        <div class="p-4 border-t flex justify-center">
          <button @click="closeModal" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Chiudi</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useQr } from "../../stores/Qr/useQr";

const qrStore = useQr();

const title = ref("");
const text = ref("");
const file = ref(null);
const preview = ref(null);
const message = ref("");
const messageColor = ref("");

// modal
const showModal = ref(false);
const selectedResource = ref({});

// carica lista dal db
onMounted(() => {
  qrStore.fetchCodes();
});

// getter reattivo
const resources = computed(() => qrStore.resources);

// Gestione file
const onFileChange = (e) => {
  const f = e.target.files[0];
  if (f) {
    file.value = f;
    preview.value = URL.createObjectURL(f);
  }
};

const reset = () => {
  title.value = "";
  text.value = "";
  file.value = null;
  preview.value = null;
  message.value = "";
};

const submit = async () => {
  if (!title.value || !text.value || !file.value) {
    message.value = "Compila tutti i campi!";
    messageColor.value = "bg-red-500";
    return;
  }

  try {
    await qrStore.addCode({
      title: title.value,
      text: text.value,
      imageFile: file.value,
    });

    message.value = "Aggiunto con successo!";
    messageColor.value = "bg-green-500";
    reset();
  } catch (err) {
    message.value = "Errore durante il salvataggio!";
    messageColor.value = "bg-red-500";
  }
};

function openModal(r) {
  selectedResource.value = r;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedResource.value = {};
}
</script>
