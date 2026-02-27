<template>
  <div class="w-full h-screen absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex items-center justify-center pointer-events-none">
    <div class="relative w-full h-full flex items-center justify-center">
      <!-- Logo centrale -->
      <img :src="frame" alt="Animation Frame" class="w-[450px] select-none" />

      <!-- Icone posizionate in cerchio -->
      <div v-if="active" class="pointer-events-auto">
        <i
          v-for="(icon, index) in icons"
          :key="index"
          :class="['fa-solid', icon.name, 'absolute', 'text-white', 'text-5xl', 'cursor-pointer']"
          :style="{
            left: `calc(50% + ${radius * Math.cos(((index * 120 - 90) * Math.PI) / 180)}px)`,
            top: `calc(50% + ${radius * Math.sin(((index * 120 - 90) * Math.PI) / 180)}px)`,
            transform: 'translate(-50%, -50%)',
          }"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
// #region Images

// #region Props
const props = defineProps({
  active: {
    type: Boolean,
    default: false,
  },
});
// #endregion
const radius = 325; // distanza dal centro
const icons = [
  { name: "fa-envelope" }, // Contatti
  { name: "fa-circle-question" }, // About
  { name: "fa-blog" }, // Blog
];

const currentFrame = ref(1);

const frameModules = import.meta.glob("../../../assets/animations/hero/*.png", { eager: true });
const frames = Object.values(frameModules).map((mod) => mod.default);

const frame = computed(() => frames[currentFrame.value]);

const isAnimating = ref(true);
let interval = null;
const maxFrame = 114; //48

onMounted(() => {
  if (!isAnimating.value) return;
  interval = setInterval(() => {
    currentFrame.value = currentFrame.value < maxFrame ? currentFrame.value + 1 : 1;
  }, 50); // Change frame every 100ms (adjust as needed)
});

onBeforeUnmount(() => {
  clearInterval(interval);
});

// #endregion
</script>

<style scoped></style>
