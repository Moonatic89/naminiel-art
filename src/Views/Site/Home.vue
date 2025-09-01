<template>
  <!-- The background color changes based on the current state -->
  <div class="relative h-screen w-full overflow-hidden" :class="currentState === 'left' ? 'bg-[#5bc6d8]' : 'bg-[#ff547e]'">
    <!-- <LangSwitcher /> -->
    <!-- Wave transition component -->
    <Wave :state="currentState" @update:state="currentState = $event" />
    <AnimatedLogo />
    <ArtNav />
  </div>
</template>

<script setup>
import ArtNav from "@/Components/Home/Arts/ArtNav.vue";
import AnimatedLogo from "@/Components/Home/Logo/AnimatedLogo.vue";
import Wave from "@/Components/Home/Waves/Wave.vue";
import { ref } from "vue";

const currentState = ref("right");
</script>
