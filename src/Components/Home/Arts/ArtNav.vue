<template>
  <!-- Contenitore assoluto sopra lo sfondo -->
  <div class="absolute inset-0 z-30 pointer-events-none flex justify-between items-start top-40 px-8">
    <!-- Original -->
    <div
      class="w-1/4 sm:w-1/6 xl:w-1/3 pointer-events-auto cursor-pointer
             animate-slideInLeft"
    >
      <router-link to="/art-og">
        <img :src="staticOg" alt="OG frame" class="w-full h-auto" />
      </router-link>
    </div>

    <!-- Fanart -->
    <div
      class="w-1/4 sm:w-1/6 xl:w-1/3 pointer-events-auto cursor-pointer
             animate-slideInRight"
    >
      <router-link to="/art-fa">
        <img :src="staticFa" alt="FA frame" class="w-full h-auto" />
      </router-link>
    </div>
  </div>
</template>

<script setup>
const staticFa =
  "https://hqbmfndntgzbgprrbrhm.supabase.co/storage/v1/object/public/nav/nav_goku.webp";
const staticOg =
  "https://hqbmfndntgzbgprrbrhm.supabase.co/storage/v1/object/public/nav/nav_venerdi.webp";
</script>

<style scoped>
@keyframes slideInLeft {
  0% {
    transform: translate(-150%, -20%) scale(0.95);
    opacity: 0.25;
  }
  60% {
    transform: translate(10%, 10%) scale(1.02); /* curva verso il basso */
    opacity: 0.7;
  }
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
}

@keyframes slideInRight {
  0% {
    transform: translate(150%, -20%) scale(0.95);
    opacity: 0.25;
  }
  60% {
    transform: translate(-10%, 10%) scale(1.02); /* curva verso il basso */
    opacity: 0.7;
  }
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
}

.animate-slideInLeft {
  animation: slideInLeft 2s cubic-bezier(0.77, 0, 0.175, 1) forwards;
}

.animate-slideInRight {
  animation: slideInRight 2s cubic-bezier(0.77, 0, 0.175, 1) forwards;
}
</style>
