<template>
  <div class="w-96 h-8w-96 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex items-center justify-center">
    <div class="absolute top-0 left-0 z-[100]">
      <SpeechBubble />
    </div>

    <img :src="frame" alt="Animation Frame" class="w-full select-none" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import SpeechBubble from "../Bubbles/SpeechBubble.vue";
// #region Images
const currentFrame = ref(1);

const frameModules = import.meta.glob("../../../assets/animations/hero/*.png", { eager: true });
const frames = Object.values(frameModules).map((mod) => mod.default);

const frame = computed(() => frames[currentFrame.value]);

const isAnimating = ref(true);
let interval = null;
const maxFrame = 20; //48

onMounted(() => {
  if (!isAnimating.value) return;
  interval = setInterval(() => {
    currentFrame.value = currentFrame.value < maxFrame ? currentFrame.value + 1 : 1;
  }, 90); // Change frame every 100ms (adjust as needed)
});

onBeforeUnmount(() => {
  clearInterval(interval);
});

// #endregion
</script>

<style scoped></style>
