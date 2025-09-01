<template>
  <div v-if="showBanner" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div class="bg-white rounded-xl shadow-lg max-w-md w-full p-6 text-center">
      <h2 class="text-xl font-bold mb-3 text-gray-900">Cookie</h2>
      <p class="text-gray-700 mb-4">Questo sito utilizza solo cookie tecnici necessari al suo corretto funzionamento. Non vengono utilizzati cookie di profilazione né per finalità pubblicitarie.</p>
      <div class="flex justify-center gap-4">
        <button @click="acceptCookies" class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600">Accetta</button>
      </div>
      <p class="mt-4 text-sm">
        <router-link to="/policy" class="text-blue-600 hover:underline"> Leggi la Privacy & Cookie Policy </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { defineExpose, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

const showBanner = ref(false);
const route = useRoute();

onMounted(() => {
  const consent = localStorage.getItem("cookie_consent");
  if (!consent) {
    showBanner.value = true;
  }
});

// osserva i cambi pagina
watch(
  () => route.fullPath,
  (newPath) => {
    if (newPath.includes("/policy")) {
      // nascondi il banner sulla pagina policy
      showBanner.value = false;
    } else {
      // se non ha accettato, torna a mostrarlo
      const consent = localStorage.getItem("cookie_consent");
      if (!consent) {
        showBanner.value = true;
      }
    }
  }
);

function acceptCookies() {
  localStorage.setItem("cookie_consent", "accepted");
  showBanner.value = false;
}

function openBanner() {
  showBanner.value = true;
}

defineExpose({ openBanner });
</script>
