<template>
  <!-- Contenitore sopra lo sfondo: occupa l'intera area con offset per la navbar mobile -->
  <div class="absolute inset-0 z-30 pointer-events-none flex flex-col md:flex-row justify-between items-center md:items-start md:top-36 top-[56px] px-4 md:px-8 pb-8 md:pb-0">

    <!-- Original Art -->
    <div
      class="pointer-events-auto cursor-pointer flex flex-col items-center gap-2 animate-slideInLeft"
      :class="['w-[28%] md:w-1/4 xl:w-1/3']"
    >
      <router-link to="/art-og" class="flex flex-col items-center gap-1">
        <img :src="staticOg" alt="Original Art" class="w-full h-auto drop-shadow-lg hover:scale-105 transition-transform duration-300" />
        <span class="text-white font-bold text-xs tracking-widest uppercase opacity-0 hover-label group-hover:opacity-100 transition-opacity duration-200 drop-shadow-md">
          Original
        </span>
      </router-link>
    </div>

    <!-- Spacer centrale (lascia spazio al logo animato assoluto) -->
    <div class="flex-1 md:block hidden" />

    <!-- Fan Art -->
    <div
      class="pointer-events-auto cursor-pointer flex flex-col items-center gap-2 animate-slideInRight"
      :class="['w-[28%] md:w-1/4 xl:w-1/3']"
    >
      <router-link to="/art-fa" class="flex flex-col items-center gap-1">
        <img :src="staticFa" alt="Fan Art" class="w-full h-auto drop-shadow-lg hover:scale-105 transition-transform duration-300" />
        <span class="text-white font-bold text-xs tracking-widest uppercase opacity-0 hover-label transition-opacity duration-200 drop-shadow-md">
          Fan Art
        </span>
      </router-link>
    </div>

  </div>

  <!-- Label permanenti sotto i personaggi, su mobile -->
  <div class="absolute bottom-6 left-0 right-0 z-30 flex justify-between px-6 md:hidden pointer-events-none">
    <span class="text-white/80 font-bold text-[10px] tracking-widest uppercase text-center w-[28%] drop-shadow">Original</span>
    <span class="text-white/80 font-bold text-[10px] tracking-widest uppercase text-center w-[28%] drop-shadow">Fan Art</span>
  </div>
</template>

<script setup>
const staticFa =
  "https://hqbmfndntgzbgprrbrhm.supabase.co/storage/v1/object/public/nav/nav_goku.webp";
const staticOg =
  "https://hqbmfndntgzbgprrbrhm.supabase.co/storage/v1/object/public/nav/nav_venerdi.webp";
</script>

<style scoped>
router-link:hover .hover-label {
  opacity: 1;
}

@keyframes slideInLeft {
  0% {
    transform: translate(-150%, -20%) scale(0.95);
    opacity: 0.25;
  }
  60% {
    transform: translate(10%, 10%) scale(1.02);
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
    transform: translate(-10%, 10%) scale(1.02);
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
