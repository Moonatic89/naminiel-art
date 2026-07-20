<template>
  <div class="relative overflow-hidden bg-gray-100" :class="wrapperClass">
    <!-- Shimmer Loader (sparisce quando l'immagine si carica) -->
    <div
      class="absolute inset-0 transition-opacity duration-500 pointer-events-none"
      :class="isLoaded ? 'opacity-0' : 'opacity-100'"
    >
      <div class="w-full h-full bg-slate-200 animate-pulse"></div>
    </div>

    <!-- Immagine -->
    <img
      :src="src"
      :alt="alt"
      class="w-full h-full transition-all duration-700 ease-out"
      :class="[imgClass, isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm']"
      :style="imgStyle"
      @load="onLoad"
      @error="onError"
      loading="lazy"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  wrapperClass: { type: [String, Array, Object], default: '' },
  imgClass: { type: [String, Array, Object], default: '' },
  imgStyle: { type: Object, default: () => ({}) }
});

const isLoaded = ref(false);
const hasError = ref(false);

function onLoad() {
  isLoaded.value = true;
}

function onError() {
  hasError.value = true;
}
</script>
