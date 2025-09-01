<template>
  <div class="pt-10 pb-20 px-4 bg-white">
    <!-- FILTRO -->
    <div class="flex items-center gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
      <div class="px-3 py-1 rounded-full border text-sm whitespace-nowrap bg-red-300" v-if="isAuthed">
        <router-link :to="url"> Carica nuova immagine </router-link>
      </div>

      <button class="px-3 py-1 rounded-full border text-sm whitespace-nowrap" :class="artStore.selectedCategory === null ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'" @click="artStore.setCategory(null)">Tutte</button>

      <button v-for="cat in artStore.categories" :key="cat" class="px-3 py-1 rounded-full border text-sm whitespace-nowrap" :class="artStore.selectedCategory === cat ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'" @click="artStore.setCategory(cat)">
        {{ cat }}
      </button>
    </div>

    <!-- GRID CARD -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 transition-all duration-75 px-2 md:px-10">
      <ArtCard v-for="item in artStore.filteredArts" :key="item.title" :art="item" :ns="props.namespace" />
    </div>
  </div>
</template>

<script setup>
import { useAuth } from "@/Composables/User/useAuth";
import { computed, onMounted } from "vue";
import ArtCard from "../../Components/Art/Card.vue";
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

onMounted(() => {
  artStore.fetchArts();
});
</script>
