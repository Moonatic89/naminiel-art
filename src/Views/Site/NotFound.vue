<template>
  <div class="relative h-screen w-full overflow-hidden bg-[#ff547e] flex flex-col items-center justify-center text-white">
    <h1 class="text-[12rem] font-black leading-none select-none opacity-20">404</h1>
    <p class="text-2xl font-semibold -mt-10 z-10">Pagina non trovata</p>
    <p class="text-base opacity-70 mt-2 z-10">Questa pagina non esiste o è stata spostata.</p>
    <router-link
      to="/"
      class="mt-8 px-6 py-3 bg-white text-[#ff547e] font-bold rounded-full shadow-lg hover:scale-105 transition-transform z-10"
    >
      Torna alla Home
    </router-link>
  </div>
</template>
