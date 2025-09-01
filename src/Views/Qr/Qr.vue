<template>
  <div v-if="resource" class="relative min-h-screen w-full overflow-hidden">
    <!-- Background Image -->
    <div
      class="fixed inset-0 bg-cover bg-top bg-no-repeat"
      :style="{ backgroundImage: `url('${resource.image}')` }"
    ></div>

    <!-- Dark Overlay with Blur -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-[3px]"></div>

    <!-- Content Container -->
    <div class="relative z-10 flex flex-col items-center min-h-screen">
      <!-- Scrolling Text Container -->
      <div
        class="max-w-prose w-full h-screen overflow-y-auto p-10 sm:p-12 bg-white/10 bg-clip-padding rounded-lg shadow-lg text-gray-100 font-serif leading-relaxed"
      >
        <h1 class="text-3xl font-bold mb-6 text-gray-100">
          {{ resource.title }}
        </h1>
        <div v-html="resource.text"></div>
      </div>
    </div>
  </div>

  <!-- Se non esiste il codice -->
  <div v-else class="flex items-center justify-center min-h-screen text-gray-200">
    <p>Codice non trovato.</p>
  </div>
</template>

<script setup>
import { useQr } from "@/stores/Qr/useQr";
import { computed, onMounted } from "vue";

// #region Props
const props = defineProps({
  namespace: String,
});
// #endregion

const qrStore = useQr();

// Assicurati che le risorse siano caricate
onMounted(async () => {
  if (!qrStore.resources.length) {
    await qrStore.fetchCodes();
  }
});

// Trova la risorsa corrispondente
const resource = computed(() =>
  qrStore.resources.find((r) => r.code === props.namespace)
);
</script>

<style scoped>
/* Personalizzazione della scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.4);
  border-radius: 4px;
}

/* Adattabilità */
@media (max-width: 640px) {
  .max-w-prose {
    max-width: 100%;
    padding: 1rem;
  }
}
</style>
