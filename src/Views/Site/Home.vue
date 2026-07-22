<template>
  <div class="relative h-screen w-full overflow-hidden">
    QUI
    <!-- INTRO -->
    <div
      v-if="!introDone"
      class="absolute inset-0 bg-black flex items-center justify-center z-20"
    >
      <!-- Finto sfondo che cresce -->
      <div
        class="absolute inset-0 transition-all duration-[2000ms] ease-in-out"
        :style="{
          clipPath: revealed
            ? 'circle(150% at center)'
            : 'circle(0% at center)',
          backgroundColor: '#ff547e'
        }"
        @transitionend="onIntroEnd"
      ></div>

      <!-- Logo al centro -->
      <AnimatedLogo class="z-10" />
    </div>

    <!-- HOME -->
    <div
      v-if="introDone"
      class="relative h-screen w-full overflow-hidden"
      :class="currentState === 'left' ? 'bg-[#5bc6d8]' : 'bg-[#ff547e]'"
    >
      <Wave :state="currentState" @update:state="currentState = $event" />
      <AnimatedLogo />
      <ArtNav />
    </div>
  </div>
</template>

<script setup>
import ArtNav from "@/Components/Home/Arts/ArtNav.vue";
import AnimatedLogo from "@/Components/Home/Logo/AnimatedLogo.vue";
import Wave from "@/Components/Home/Waves/Wave.vue";
import { onMounted, ref } from "vue";

// stato intro
const revealed = ref(false);
const introDone = ref(false);

// stato home
const currentState = ref("right");

const INTRO_KEY = "naminiel_intro_shown";

onMounted(() => {
  // Se l'intro è già stata mostrata in questa sessione, saltala
  if (sessionStorage.getItem(INTRO_KEY)) {
    introDone.value = true;
    return;
  }

  // Rimuovi il flag alla chiusura/uscita dal sito così riparte alla riapertura
  window.addEventListener("beforeunload", () => {
    sessionStorage.removeItem(INTRO_KEY);
  }, { once: true });

  setTimeout(() => {
    revealed.value = true; // fa partire il cerchio
  }, 1000);
});

function onIntroEnd() {
  // quando l'animazione del cerchio è finita → salva il flag e mostra la home
  sessionStorage.setItem(INTRO_KEY, "1");
  introDone.value = true;
}
</script>
