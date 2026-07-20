<template>
  <div class="pt-10 pb-20 px-4 bg-white">
    <!-- FILTRO -->
    <div class="flex items-center gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
      <div class="px-3 py-1 rounded-full border text-sm whitespace-nowrap bg-red-300" v-if="isAuthed">
        <router-link :to="url"> Carica nuova immagine </router-link>
      </div>
      <div class="px-3 py-1 rounded-full border text-sm whitespace-nowrap bg-gray-700 text-white" v-if="isAuthed">
        <router-link to="/orphans"><i class="fa-solid fa-ghost mr-1"></i> Orfani</router-link>
      </div>

      <button class="px-3 py-1 rounded-full border text-sm whitespace-nowrap" :class="artStore.selectedCategory === null ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'" @click="artStore.setCategory(null)">Tutte</button>

      <button v-for="cat in artStore.categories" :key="cat" class="px-3 py-1 rounded-full border text-sm whitespace-nowrap" :class="artStore.selectedCategory === cat ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'" @click="artStore.setCategory(cat)">
        {{ cat }}
      </button>

      <!-- Search Input -->
      <div class="relative ml-auto flex-shrink-0">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
        <input 
          v-model="artStore.searchQuery"
          type="text"
          placeholder="Cerca..."
          class="pl-9 pr-4 py-1.5 border rounded-full text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 w-32 md:w-48 transition-all"
        />
      </div>
    </div>

    <!-- GRID CARD MASONRY -->
    <div class="columns-1 sm:columns-2 xl:columns-3 gap-4 px-2 md:px-10 mb-8">
      <!-- Aggiungo mb-4 e flex flex-col in Card per evitare spezzamenti -->
      <ArtCard 
        v-for="(item, index) in artStore.filteredArts" 
        :key="item.title" 
        :art="item" 
        :ns="props.namespace" 
        class="break-inside-avoid mb-4" 
        @open-lightbox="openLightbox(index)"
      />
    </div>

    <!-- Infinite Scroll Trigger -->
    <div ref="loadMoreTrigger" class="h-10 w-full flex justify-center items-center py-8">
      <div v-if="artStore.isLoading" class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <p v-else-if="!artStore.hasMore && artStore.filteredArts.length > 0" class="text-gray-500 text-sm">Non ci sono altre immagini da mostrare.</p>
    </div>

    <!-- Lightbox Fullscreen -->
    <Lightbox 
      :show="isLightboxOpen" 
      :images="artStore.filteredArts" 
      v-model:currentIndex="lightboxIndex" 
      @close="closeLightbox" 
    />
  </div>
</template>

<script setup>
import { useAuth } from "@/Composables/User/useAuth";
import { computed, onMounted, onUnmounted, ref } from "vue";
import ArtCard from "../../Components/Art/Card.vue";
import Lightbox from "../../Components/Art/Lightbox.vue";
import { useArt } from "../../stores/Art/useArt";

const { isAuthed } = useAuth();
const props = defineProps({
  namespace: { type: String, required: true },
});

// costruiamo lo store dinamicamente
const useArtStore = useArt(props.namespace);
const artStore = useArtStore();

const url = computed(() => {
  return "art-" + props.namespace + "/new";
});

const loadMoreTrigger = ref(null);
let observer = null;

onMounted(() => {
  // fetchArt initial con reset = true
  if (artStore.arts.length === 0) {
    artStore.fetchArts(true);
  }

  // Set up Intersection Observer
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && artStore.hasMore && !artStore.isLoading) {
      artStore.loadMore();
    }
  }, {
    rootMargin: '100px', // Carica poco prima di raggiungere il fondo
  });

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value);
  }
});

onUnmounted(() => {
  if (observer && loadMoreTrigger.value) {
    observer.unobserve(loadMoreTrigger.value);
  }
});

// Gestione Lightbox
const isLightboxOpen = ref(false);
const lightboxIndex = ref(0);

function openLightbox(index) {
  lightboxIndex.value = index;
  isLightboxOpen.value = true;
  document.body.style.overflow = 'hidden'; // blocca scroll
}

function closeLightbox() {
  isLightboxOpen.value = false;
  document.body.style.overflow = ''; // sblocca scroll
}
</script>
