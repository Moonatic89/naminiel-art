<template>
  <div class="pt-10 pb-20 px-4 bg-white">
    <!-- FILTRO -->
    <div class="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
      <div class="px-3 py-1 rounded-full border text-sm whitespace-nowrap bg-red-300" v-if="isAuthed">
        <router-link to="/post/new"> Carica nuova immagine </router-link>
      </div>
      <div class="px-3 py-1 rounded-full border text-sm whitespace-nowrap bg-gray-700 text-white" v-if="isAuthed">
        <router-link to="/orphans"><i class="fa-solid fa-ghost mr-1"></i> Orfani</router-link>
      </div>
      <button class="px-3 py-1 rounded-full border text-sm whitespace-nowrap" :class="blog.selectedCategory === null ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'" @click="blog.setCategory(null)">Tutte</button>

      <button v-for="cat in blog.categories" :key="cat" class="px-3 py-1 rounded-full border text-sm whitespace-nowrap" :class="blog.selectedCategory === cat ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'" @click="blog.setCategory(cat)">
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
          v-model="blog.searchQuery"
          type="text"
          placeholder="Cerca..."
          class="pl-9 pr-4 py-1.5 border rounded-full text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 w-32 md:w-48 transition-all"
        />
      </div>
    </div>
    <!-- GRID CARD -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 transition-all duration-75 px-2 md:px-10 mb-8">
      <Card v-for="card in blog.filteredPosts" :post="card" :key="card.title" />
    </div>

    <!-- Infinite Scroll Trigger -->
    <div ref="loadMoreTrigger" class="h-10 w-full flex justify-center items-center py-8">
      <div v-if="blog.isLoading" class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <p v-else-if="!blog.hasMore && blog.filteredPosts.length > 0" class="text-gray-500 text-sm">Non ci sono altri post da mostrare.</p>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from "@/Composables/User/useAuth";
import { onMounted, onUnmounted, ref } from "vue";
import Card from "../../Components/Blog/Card.vue";
import { useBlog } from "../../stores/Blog/Blog";

const { isAuthed } = useAuth();

const blog = useBlog();

const loadMoreTrigger = ref(null);
let observer = null;

onMounted(() => {
  // Load initially Se vuoto
  if (blog.posts.length === 0) {
    blog.fetchPosts(true);
  }

  // Set up Intersection Observer
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && blog.hasMore && !blog.isLoading) {
      blog.loadMore();
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
