<template>
  <div>
    <Motion class="relative group overflow-hidden rounded-xl shadow-lg card" :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0 }" @click="openModal">
      <!-- Immagine -->
      <img :src="art.img" :alt="art.title" class="w-full h-72 object-cover bg-white transition-transform duration-500 group-hover:scale-105" />

      <!-- Overlay con titolo e categoria -->
      <div class="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <h2 class="text-white text-lg font-semibold">{{ art.title }}</h2>
        <span class="text-sm text-gray-200 cursor-pointer hover:underline" @click.stop="artStore.setCategory(art.category)">
          {{ art.category }}
        </span>
      </div>
      <div @click.stop class="text-black bg-white rounded-full px-1 shadow-lg top-2 right-2 absolute cursor-pointer flex justify-center items-center" v-if="isAuthed">
        <router-link :to="`/art-${ns}/edit/${art.id}`"><i class="fa-solid fa-pen-to-square"></i></router-link>
      </div>
    </Motion>

    <!-- Modale -->
    <transition name="fade">
      <div @contextmenu.prevent v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" @click="closeModal">
        <!-- contenuto modale -->
        <div class="bg-white rounded-2xl w-full max-w-md mx-4 sm:mx-0 overflow-y-auto max-h-[90vh] p-4" @click.stop>
          <button class="ml-auto block text-gray-500 hover:text-gray-800" @click="closeModal">✕</button>
          <img :src="art.img" :alt="art.title" class="w-full h-full object-contain bg-white transition-transform duration-500 group-hover:scale-105" />
          <h2 class="text-xl font-bold mb-2">{{ art.title }}</h2>
          <p class="text-sm text-gray-700 mb-2"><strong>Categoria:</strong> {{ art.category }}</p>
          <p class="text-gray-600 mb-4">{{ art.description }}</p>

          <!-- Bottone rimozione, visibile solo se autenticato -->
          <button v-if="isAuthed" class="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700" @click="confirmRemove">Rimuovi Art</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { useAuth } from "@/Composables/User/useAuth";
import { useUserStore } from "@/stores/User/User";
import { ref } from "vue";
import { useArt } from "../../stores/Art/useArt";

const { isAuthed } = useAuth();

const showModal = ref(false);
const openModal = () => (showModal.value = true);
const closeModal = () => (showModal.value = false);

const props = defineProps({
  art: Object, // contiene { id, title, category, description, img, fileName }
  ns: String,
});

const artStore = useArt(props.ns); // <-- passa il namespace corretto
const userStore = useUserStore();

async function confirmRemove() {
  if (confirm("Sei sicuro di voler rimuovere questa immagine?")) {
    try {
      await artStore.removeArt(props.art.id, props.art.fileName);
      closeModal();
    } catch (err) {
      alert("Errore nella rimozione: " + err.message);
    }
  }
}
// onMounted(() => {
//   window.addEventListener("contextmenu", (e) => e.preventDefault());
// });
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
