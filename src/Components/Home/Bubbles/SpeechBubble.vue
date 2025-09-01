<template>
  <Transition name="bubble" v-if="showBubble && active">
    <div class="relative flex justify-center items-center" :style="bubbleStyle">
      <div class="speech-bubble select-none">
        {{ currentMessage }}
        {{ getRandomMessage() }}
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watchEffect } from "vue";
import { useLangStore } from "../../../stores/Language/useLangStore";

defineProps({
  active: {
    type: Boolean,
    default: false,
  },
});

// #region Language

const langStore = useLangStore();
const text = ref(null);

watchEffect(async () => {
  text.value = await langStore.get("Site/Home#messages");
});

// #endregion

const showBubble = ref(true);
const currentMessage = ref("");
const bubbleStyle = ref({});

// const messages = ["Ciao!", "Come va?", "Che bella giornata!", "Mi piacciono i gatti!", "Hai visto il cielo oggi?", "Sto aspettando qualcuno...", "Ho una storia da raccontare!", "Vieni più vicino!"];

const setRandomPosition = () => {
  // Altezza casuale sopra l'immagine (tra -120px e -50px rispetto al centro)
  const topOffset = -(Math.random() * (120 - 50) + 50);

  // Larghezza casuale centrata intorno all'immagine (-80px a 80px)
  const leftOffset = Math.random() * 160 - 80;

  bubbleStyle.value = {
    position: "absolute",
    top: `${topOffset}px`,
    left: `${leftOffset}px`,
  };
};

const getRandomMessage = () => {
  const values = Object.values(text.value || {});
  const newText = values[Math.floor(Math.random() * values.length)];
  return newText;
};

const getRandomDelay = (min = 4000, max = 8000) => Math.random() * (max - min) + min;

const showAndHideBubble = () => {
  currentMessage.value = getRandomMessage();
  setRandomPosition();
  showBubble.value = true;

  setTimeout(() => {
    showBubble.value = false;

    setTimeout(showAndHideBubble, getRandomDelay());
  }, 3000);
};

let hideTimeout, nextShowTimeout;

onMounted(() => {
  showAndHideBubble();
});

onBeforeUnmount(() => {
  clearTimeout(hideTimeout);
  clearTimeout(nextShowTimeout);
});
</script>

<style scoped>
.speech-bubble {
  position: relative;
  background: white;
  border: 4px solid black;
  padding: 16px 24px;
  border-radius: 20px;
  max-width: 300px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.3);
}

/* Coda del balloon */
.speech-bubble::after {
  content: "";
  position: absolute;
  bottom: -20px;
  left: 50px;
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 20px solid black;
}

.speech-bubble::before {
  content: "";
  position: absolute;
  bottom: -18px;
  left: 51px;
  width: 0;
  height: 0;
  border-left: 14px solid transparent;
  border-right: 14px solid transparent;
  border-top: 18px solid white;
}

/* Animazione Vue Transition */
.bubble-enter-active {
  transition: all 0.5s ease-out;
}

.bubble-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.bubble-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
