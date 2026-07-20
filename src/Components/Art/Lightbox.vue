<template>
  <transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm" @click.self="closeLightbox">
      
      <!-- Controlli Top -->
      <div class="absolute top-4 right-4 flex gap-4 z-10">
        <button @click="closeLightbox" class="text-white hover:text-gray-300 transition bg-black/50 p-2 rounded-full w-10 h-10 flex items-center justify-center">
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <!-- Immagine Centrale Container -->
      <div class="relative w-full h-full p-4 md:p-10 flex flex-col items-center justify-center pointer-events-none">
        
        <!-- Freccia Precedente -->
        <button v-if="hasPrev" @click="prevImage" class="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition bg-black/50 p-3 rounded-full pointer-events-auto hidden md:block">
          <i class="fa-solid fa-chevron-left text-2xl"></i>
        </button>

        <!-- Wrapper Immagine (zoomabile) -->
        <div class="relative max-w-full max-h-full flex flex-col justify-center items-center pointer-events-auto group">
          <img 
            :src="currentImage.img" 
            :alt="currentImage.title"
            class="max-w-full max-h-[80vh] object-contain rounded shadow-2xl transition-transform duration-300"
            @click.stop
          />
          
          <!-- Didascalia -->
          <div class="mt-4 text-center">
            <h2 class="text-white text-xl font-bold drop-shadow-md">{{ currentImage.title }}</h2>
            <p class="text-gray-300 mt-1 drop-shadow-md">{{ currentImage.category }}</p>
          </div>
        </div>

        <!-- Freccia Successiva -->
        <button v-if="hasNext" @click="nextImage" class="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition bg-black/50 p-3 rounded-full pointer-events-auto hidden md:block">
          <i class="fa-solid fa-chevron-right text-2xl"></i>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  show: { type: Boolean, required: true },
  images: { type: Array, required: true }, // [ { img: 'url', title: '...', category: '...' }, ... ]
  currentIndex: { type: Number, required: true }
});

const emit = defineEmits(['close', 'update:currentIndex']);

const currentImage = computed(() => props.images[props.currentIndex]);
const hasPrev = computed(() => props.currentIndex > 0);
const hasNext = computed(() => props.currentIndex < props.images.length - 1);

function closeLightbox() {
  emit('close');
}

function prevImage() {
  if (hasPrev.value) {
    emit('update:currentIndex', props.currentIndex - 1);
  }
}

function nextImage() {
  if (hasNext.value) {
    emit('update:currentIndex', props.currentIndex + 1);
  }
}

// Navigazione da tastiera
function handleKeydown(e) {
  if (!props.show) return;
  
  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowLeft') prevImage();
  else if (e.key === 'ArrowRight') nextImage();
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
