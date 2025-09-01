<template>
  <!-- lascia passare gli eventi nel vuoto -->
  <div class="absolute inset-0 z-30 pointer-events-none flex flex-col md:flex-row justify-between items-center">
    <!-- riattiva gli eventi SOLO sulle card -->
    <div v-if="selectedOg" class="xl:w-1/12 lg:w-[] w-1/4 sm:w-1/6 m-20 pointer-events-auto cursor-pointer">
      <router-link to="/art-og">
        <img :src="selectedOg" alt="OG frame" />
        <h1 class="text-2xl text-center md:text-3xl font-extrabold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-400 drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">Original</h1>
      </router-link>
    </div>

    <div v-if="selectedFa" class="xl:w-1/12 lg:w-[] w-1/4 sm:w-1/6 m-20 pointer-events-auto cursor-pointer">
      <router-link to="/art-fa">
        <img :src="selectedFa" alt="FA frame" />
        <h1 class="text-2xl text-center md:text-3xl font-extrabold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-300 to-neutral-500 drop-shadow-[0_6px_24px_rgba(255,255,255,0.25)]">Fanart</h1>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

/* Props opzionali: liste personalizzate.
   Se non fornite, si usano le immagini scansionate dalle cartelle. */
const props = defineProps({
  og: { type: Array, default: null },
  fa: { type: Array, default: null },
});

/* Scansione automatica cartelle (Vite) */
const scannedOg = Object.values(
  import.meta.glob("/src/assets/frames/og/*.{png,jpg,jpeg,webp,avif,gif,svg}", {
    eager: true,
    import: "default",
  })
);

const scannedFa = Object.values(
  import.meta.glob("/src/assets/frames/fa/*.{png,jpg,jpeg,webp,avif,gif,svg}", {
    eager: true,
    import: "default",
  })
);

/* Sorgenti effettive */
const ogPool = computed(() => (props.og && props.og.length ? props.og : scannedOg));
const faPool = computed(() => (props.fa && props.fa.length ? props.fa : scannedFa));

/* Scelte correnti */
const selectedOg = ref("");
const selectedFa = ref("");

function pickRandom(arr) {
  if (!arr || arr.length === 0) return undefined;
  const i = Math.floor(Math.random() * arr.length);
  return arr[i];
}

function reshuffle() {
  const og = pickRandom(ogPool.value);
  const fa = pickRandom(faPool.value);
  selectedOg.value = typeof og === "string" ? og : "";
  selectedFa.value = typeof fa === "string" ? fa : "";
}

/* Random alla prima montata (quindi anche al refresh della pagina) */
onMounted(() => {
  reshuffle();
});

/* Opzionale: esponi il metodo per rimescolare dall'esterno */
defineExpose({ reshuffle });
</script>
