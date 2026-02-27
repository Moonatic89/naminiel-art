<template>
  <div class="min-h-screen bg-gray-100 py-10 px-4">
    <div class="max-w-5xl mx-auto">

      <!-- Header -->
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">File orfani</h1>
          <p class="text-sm text-gray-500 mt-0.5">File presenti nei bucket Storage senza un record nel database.</p>
        </div>
        <button
          @click="store.scanAll()"
          :disabled="store.scanning"
          class="flex items-center gap-2 px-5 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition disabled:opacity-50"
        >
          <i class="fa-solid fa-rotate" :class="{ 'fa-spin': store.scanning }"></i>
          {{ store.scanning ? "Scansione..." : "Scansiona" }}
        </button>
      </div>

      <!-- Errore -->
      <div v-if="store.error" class="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
        <i class="fa-solid fa-triangle-exclamation mr-2"></i> {{ store.error }}
      </div>

      <!-- Stato iniziale -->
      <div v-if="!store.scanning && !store.error && store.orphans.length === 0 && !scannedOnce"
        class="mt-16 text-center text-gray-400">
        <i class="fa-solid fa-ghost text-5xl mb-4 block"></i>
        <p class="text-lg font-medium">Premi "Scansiona" per cercare file orfani</p>
      </div>

      <!-- Nessun orfano dopo scansione -->
      <div v-else-if="!store.scanning && scannedOnce && store.orphans.length === 0"
        class="mt-16 text-center text-gray-400">
        <i class="fa-solid fa-circle-check text-5xl text-green-400 mb-4 block"></i>
        <p class="text-lg font-medium text-green-600">Nessun file orfano trovato!</p>
        <p class="text-sm mt-1">Tutti i file nei bucket hanno un record nel database.</p>
      </div>

      <!-- Lista orfani -->
      <div v-if="store.orphans.length" class="mt-6 space-y-3">
        <!-- Gruppi per bucket -->
        <template v-for="(group, label) in grouped" :key="label">
          <div class="mt-6">
            <h2 class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
              <span class="inline-block px-2 py-0.5 rounded-full text-white text-xs"
                :class="bucketColor(group[0]?.bucket)">
                {{ label }}
              </span>
              <span>{{ group.length }} file</span>
            </h2>

            <div class="space-y-3">
              <div
                v-for="orphan in group"
                :key="orphan.bucket + orphan.fileName"
                class="bg-white rounded-2xl shadow overflow-hidden"
                :class="{
                  'ring-2 ring-green-400': orphan._status === 'done',
                  'ring-2 ring-red-400': orphan._status === 'deleted',
                  'opacity-50': orphan._status === 'done' || orphan._status === 'deleted',
                }"
              >
                <div class="flex gap-0">
                  <!-- Thumbnail -->
                  <div class="w-32 h-32 flex-shrink-0 bg-gray-100">
                    <img :src="orphan.publicUrl" :alt="orphan.fileName"
                      class="w-full h-full object-cover" loading="lazy" />
                  </div>

                  <!-- Info + form -->
                  <div class="flex-1 p-4">
                    <!-- Filename + size -->
                    <div class="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <p class="text-sm font-mono text-gray-600 break-all leading-tight">{{ orphan.fileName }}</p>
                        <p v-if="orphan.size" class="text-xs text-gray-400 mt-0.5">{{ formatSize(orphan.size) }}</p>
                      </div>
                      <div class="flex gap-1 flex-shrink-0">
                        <span v-if="orphan._status === 'done'"
                          class="text-xs text-green-600 flex items-center gap-1 font-medium">
                          <i class="fa-solid fa-circle-check"></i> Adottato
                        </span>
                        <span v-else-if="orphan._status === 'deleted'"
                          class="text-xs text-red-500 flex items-center gap-1 font-medium">
                          <i class="fa-solid fa-trash"></i> Eliminato
                        </span>
                      </div>
                    </div>

                    <!-- Form (collassabile, visibile solo se non già adottato/eliminato) -->
                    <template v-if="!orphan._status">
                      <!-- Toggle form -->
                      <button
                        v-if="!orphan._open"
                        @click="orphan._open = true"
                        class="text-sm text-pink-500 hover:text-pink-700 font-medium transition"
                      >
                        <i class="fa-solid fa-pen mr-1"></i> Adotta come...
                      </button>

                      <div v-else class="space-y-2">
                        <!-- Tipo adozione -->
                        <div class="flex gap-2 flex-wrap">
                          <button
                            v-for="opt in adoptOptions(orphan)"
                            :key="opt.value"
                            @click="orphan._adoptType = opt.value"
                            class="text-xs px-3 py-1 rounded-full border font-medium transition"
                            :class="orphan._adoptType === opt.value
                              ? 'bg-pink-500 text-white border-pink-500'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-pink-300'"
                          >
                            {{ opt.label }}
                          </button>
                        </div>

                        <!-- Campi comuni -->
                        <input v-model="orphan._title" type="text" placeholder="Titolo *"
                          class="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300" />
                        <input v-model="orphan._category" type="text" placeholder="Categoria *"
                          class="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300" />

                        <!-- Campi specifici per tipo -->
                        <input
                          v-if="orphan._adoptType !== 'post'"
                          v-model="orphan._description"
                          type="text"
                          placeholder="Descrizione (opzionale)"
                          class="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                        <textarea
                          v-if="orphan._adoptType === 'post'"
                          v-model="orphan._body"
                          rows="2"
                          placeholder="Testo post (HTML, opzionale)"
                          class="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />

                        <!-- Azioni -->
                        <div class="flex gap-2 pt-1">
                          <button
                            @click="adopt(orphan)"
                            :disabled="orphan._loading"
                            class="px-4 py-1.5 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 transition disabled:opacity-50 flex items-center gap-1"
                          >
                            <i v-if="orphan._loading" class="fa-solid fa-spinner fa-spin"></i>
                            <i v-else class="fa-solid fa-heart"></i>
                            {{ orphan._loading ? "Salvataggio..." : "Adotta" }}
                          </button>
                          <button @click="orphan._open = false"
                            class="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
                            Annulla
                          </button>
                        </div>
                      </div>
                    </template>
                  </div>

                  <!-- Elimina -->
                  <button
                    v-if="!orphan._status"
                    :disabled="orphan._loading"
                    @click="confirmDelete(orphan)"
                    class="px-4 text-gray-300 hover:text-red-500 transition flex-shrink-0 flex items-center"
                    title="Elimina dallo Storage"
                  >
                    <i class="fa-solid fa-trash text-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

    </div>

    <!-- Modal conferma eliminazione -->
    <Modal
      :show="showDeleteModal"
      title="Elimina file"
      message="Il file verrà rimosso definitivamente dallo storage. Questa operazione non è reversibile."
      @cancel="showDeleteModal = false; pendingDelete = null"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, reactive } from "vue";
import { useOrphans } from "@/stores/useOrphans";
import Modal from "@/Components/Utilities/Modal.vue";

const store = useOrphans();
const scannedOnce = ref(false);

// Avvia la scansione al mount
onMounted(async () => {
  await store.scanAll();
  scannedOnce.value = true;

  // Aggiungi campi reattivi locali a ogni orfano
  store.orphans.forEach(initOrphan);
});

// Inizializza campi UI reattivi su ogni item
function initOrphan(orphan) {
  if (!("_open" in orphan)) {
    orphan._open = false;
    orphan._loading = false;
    orphan._status = null; // null | 'done' | 'deleted'
    orphan._adoptType = orphan.adoptType; // 'art' | 'post'
    orphan._title = "";
    orphan._category = "";
    orphan._description = "";
    orphan._body = "";
  }
}

// Raggruppamento per label (Art OG / Art FA / Blog Post)
const grouped = computed(() => {
  const result = {};
  store.orphans.forEach(o => {
    initOrphan(o);
    const key = o.label;
    if (!result[key]) result[key] = [];
    result[key].push(o);
  });
  return result;
});

// Opzioni di adozione per tipo
function adoptOptions(orphan) {
  if (orphan.bucket === "posts") {
    return [{ value: "post", label: "Blog Post" }];
  }
  return [
    { value: "art", label: `Art ${orphan.namespace?.toUpperCase() ?? ""}` },
    { value: "post", label: "Blog Post" },
  ];
}

// Colore badge per bucket
function bucketColor(bucket) {
  if (bucket === "art-og") return "bg-violet-500";
  if (bucket === "art-fa") return "bg-blue-500";
  return "bg-amber-500";
}

// Formatta dimensione file
function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

// Adozione
async function adopt(orphan) {
  if (!orphan._title.trim()) { alert("Inserisci un titolo"); return; }
  if (!orphan._category.trim()) { alert("Inserisci una categoria"); return; }

  orphan._loading = true;
  try {
    if (orphan._adoptType === "art") {
      await store.adoptAsArt(orphan, {
        title: orphan._title.trim(),
        category: orphan._category.trim(),
        description: orphan._description.trim(),
      });
    } else {
      await store.adoptAsBlogPost(orphan, {
        title: orphan._title.trim(),
        category: orphan._category.trim(),
        body: orphan._body.trim(),
      });
    }
    orphan._status = "done";
  } catch (err) {
    alert("Errore: " + err.message);
  } finally {
    orphan._loading = false;
  }
}

// Eliminazione con modal di conferma
const showDeleteModal = ref(false);
const pendingDelete = ref(null);

function confirmDelete(orphan) {
  pendingDelete.value = orphan;
  showDeleteModal.value = true;
}

async function doDelete() {
  const orphan = pendingDelete.value;
  showDeleteModal.value = false;
  pendingDelete.value = null;
  if (!orphan) return;

  orphan._loading = true;
  try {
    await store.deleteOrphan(orphan);
    orphan._status = "deleted";
  } catch (err) {
    alert("Errore durante l'eliminazione: " + err.message);
  } finally {
    orphan._loading = false;
  }
}
</script>
