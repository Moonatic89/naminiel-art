<template>
  <div class="flex w-full h-full justify-between relative overflow-hidden">
    <!-- Left/Top Section -->
    <div class="h-full w-2/5 bg-transparent md:block hidden" @mouseenter="handleLeft" @touchstart="handleLeft"></div>
    <div class="w-full h-2/5 bg-transparent block md:hidden" @mouseenter="handleTop" @touchstart="handleTop"></div>

    <!-- Right/Bottom Section -->
    <div class="h-full w-2/5 bg-transparent md:block hidden" @mouseenter="handleRight" @touchstart="handleRight"></div>
    <div class="w-full h-2/5 bg-transparent block md:hidden" @mouseenter="handleBottom" @touchstart="handleBottom"></div>

    <!-- Left Transition Effect (desktop) -->
    <div v-if="!isMobile && toggles.left" class="h-full absolute top-0 left-[-230%] z-10 scale-x-[230%] origin-left transition-transform" :class="!toggles.transition ? 'translate-x-0' : 'translate-x-[230%]'" :style="{ transitionDuration: waveDuration }">
      <img class="h-full" :style="{ maxWidth: maxImageWidth + 'px' }" src="@/assets/wave/redWave.png" alt="Left Wave" />
    </div>

    <!-- Right Transition Effect (desktop) -->
    <div v-if="!isMobile && toggles.right" class="h-full absolute top-0 right-[-230%] z-10 scale-x-[230%] origin-right transition-transform" :class="!toggles.transition ? 'translate-x-0' : 'translate-x-[-230%]'" :style="{ transitionDuration: waveDuration }">
      <img class="h-full" :style="{ maxWidth: maxImageWidth + 'px' }" src="@/assets/wave/cyanWave.png" alt="Right Wave" />
    </div>

    <div
      v-if="isMobile && toggles.top"
      class="w-full absolute left-0 top-[-230%] z-10 scale-y-[230%] origin-top transition-transform"
      :style="{
        transform: toggles.transition ? 'translateY(230%)' : 'translateY(0)',
        transitionDuration: waveDuration,
      }">
      <img class="w-full" :style="{ maxHeight: maxImageWidth + 'px' }" src="@/assets/wave/redWave.png" alt="Top Wave" />
    </div>

    <div
      v-if="isMobile && toggles.bottom"
      class="w-full absolute left-0 bottom-[-230%] z-10 scale-y-[230%] origin-bottom transition-transform"
      :style="{
        transform: toggles.transition ? 'translateY(-230%)' : 'translateY(0)',
        transitionDuration: waveDuration,
      }">
      <img class="w-full" :style="{ maxHeight: maxImageWidth + 'px' }" src="@/assets/wave/cyanWave.png" alt="Bottom Wave" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const waveDuration = ref("1000ms");

const toggles = ref({
  left: false,
  right: false,
  top: false,
  bottom: false,
  transition: false,
});

const props = defineProps({
  state: String,
});

const emit = defineEmits(["update:state"]);

const maxImageWidth = ref(window.innerWidth * 1);
const isMobile = ref(window.innerWidth < 768);

const updateMaxImageWidth = () => {
  const width = window.innerWidth;
  const multiplier = 1.55;
  const speed = 2.5;

  const distance = width * multiplier;
  const duration = distance / speed;

  maxImageWidth.value = distance;
  waveDuration.value = `${duration}ms`;
};

const StartTransition = (dir: string) => {
  toggles.value.transition = true;
  setTimeout(() => {
    changeState(dir);
  }, 1000);
};

// ---- Desktop handlers
const handleLeft = () => {
  if (props.state === "right") return;
  toggles.value.left = true;
  setTimeout(() => {
    StartTransition("right");
  }, 100);
};

const handleRight = () => {
  if (props.state === "left") return;
  toggles.value.right = true;
  setTimeout(() => {
    StartTransition("left");
  }, 100);
};

// ---- Mobile handlers
// ---- Mobile handlers
const handleTop = () => {
  console.log("[WaveVertical] handleTop triggered | currentState =", props.state);
  if (props.state === "bottom") {
    console.log("[WaveVertical] Ignoro: già in stato 'bottom'");
    return;
  }
  console.log("[WaveVertical] Avvio animazione dall’alto");
  toggles.value.top = true;
  setTimeout(() => {
    StartTransition("bottom");
  }, 100);
};

const handleBottom = () => {
  console.log("[WaveVertical] handleBottom triggered | currentState =", props.state);
  if (props.state === "top") {
    console.log("[WaveVertical] Ignoro: già in stato 'top'");
    return;
  }
  console.log("[WaveVertical] Avvio animazione dal basso");
  toggles.value.bottom = true;
  setTimeout(() => {
    StartTransition("top");
  }, 100);
};

const changeState = (dir: string) => {
  emit("update:state", dir);
  toggles.value.left = false;
  toggles.value.right = false;
  toggles.value.top = false;
  toggles.value.bottom = false;
  toggles.value.transition = false;
};

onMounted(() => {
  const waveWidthMultiplier = 12.55;
  maxImageWidth.value = window.innerWidth * waveWidthMultiplier;
  isMobile.value = window.innerWidth < 768;
  console.log("[WaveVertical] onMounted | isMobile =", isMobile.value);

  window.addEventListener("resize", updateMaxImageWidth);
  window.addEventListener("resize", () => {
    isMobile.value = window.innerWidth < 768;
    console.log("[WaveVertical] resize | isMobile =", isMobile.value);
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateMaxImageWidth);
});
</script>
