<template>
  <div class="pt-10 pb-20 px-4 bg-white">
    <!-- FILTRO -->
    <div class="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
      <div class="px-3 py-1 rounded-full border text-sm whitespace-nowrap bg-red-300" v-if="isAuthed">
        <router-link to="post/new"> Carica nuova immagine </router-link>
      </div>
      <button class="px-3 py-1 rounded-full border text-sm whitespace-nowrap" :class="blog.selectedCategory === null ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'" @click="blog.setCategory(null)">Tutte</button>

      <button v-for="cat in blog.categories" :key="cat" class="px-3 py-1 rounded-full border text-sm whitespace-nowrap" :class="blog.selectedCategory === cat ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'" @click="blog.setCategory(cat)">
        {{ cat }}
      </button>
    </div>
    <!-- GRID CARD -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 transition-all duration-75 px-2 md:px-10">
      <Card v-for="card in blog.filteredPosts" :post="card" :key="card.title" />
    </div>
  </div>
</template>

<script setup>
import { useAuth } from "@/Composables/User/useAuth";
import { onMounted } from "vue";
import Card from "../../Components/Blog/Card.vue";
import { useBlog } from "../../stores/Blog/Blog";

const { isAuthed } = useAuth();

const blog = useBlog();

onMounted(() => {
  blog.fetchPosts();
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
