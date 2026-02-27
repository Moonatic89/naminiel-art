<template>
  <div class="relative">
    <Nav />
    <router-view v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="$route.path" />
      </Transition>
    </router-view>

    <!-- Icona in basso -->
    <div class="absolute z-[999] bottom-0 right-0 p-2">
      <div class="cursor-pointer" @click="cookieBanner?.openBanner()">
        <i class="fa-solid fa-cookie"></i>
      </div>
    </div>

    <!-- Banner -->
    <CookieBanner ref="cookieBanner" />
  </div>
</template>

<script setup>
import { useLangStore } from "@/stores/Language/useLangStore";
import { ref, watchEffect } from "vue";
import CookieBanner from "./Components/Layout/Cookie/CookieBanner.vue";
import Nav from "./Components/Layout/Navbar/Nav.vue";
const langStore = useLangStore();
const text = ref(null);
const cookieBanner = ref(null);
watchEffect(async () => {
  text.value = await langStore.get("Site/Home");
});
</script>

<style>
/* Scrollbar stile "mobile-like" */
::-webkit-scrollbar {
  width: 6px; /* sottilissima */
  height: 6px; /* anche per scroll orizzontale */
}

::-webkit-scrollbar-track {
  background: transparent; /* niente sfondo visibile */
}

::-webkit-scrollbar-thumb {
  background-color: rgba(244, 63, 94, 0.6); /* colore thumb semi-trasparente */
  border-radius: 9999px; /* super arrotondata */
  margin: 2px; /* margine per accorciare visivamente */
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(244, 63, 94, 0.9);
}

/* Nascondi frecce su WebKit */
::-webkit-scrollbar-button {
  display: none;
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(244, 63, 94, 0.6) transparent;
}

/* Transizione tra pagine */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
