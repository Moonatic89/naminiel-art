<template>
  <div>
    <Motion class="relative group overflow-hidden rounded-xl shadow-lg card cursor-pointer" :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0 }" @click="$emit('open-lightbox')">
      <!-- Immagine con Lazy Loading Blur-up -->
      <LazyImage
        :src="art.img"
        :alt="art.title"
        wrapperClass="w-full bg-slate-100"
        imgClass="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
        :imgStyle="{ objectFit: art.img_fit || 'cover', objectPosition: art.img_position || 'center', maxHeight: '800px' }"
      />

      <!-- Overlay con titolo e categoria -->
      <div class="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <h2 class="text-white text-lg font-semibold">{{ art.title }}</h2>
        <span class="text-sm text-gray-200 cursor-pointer hover:underline" @click.stop="artStore.setCategory(art.category)">
          {{ art.category }}
        </span>
      </div>
      <div @click.stop class="text-black bg-white rounded-full px-1 shadow-lg top-2 right-2 absolute cursor-pointer flex justify-center items-center" v-if="isAuthed">
        <router-link :to="`/art-${ns}/edit/${art.id}`"><i class="fa-solid fa-pen-to-square"></i></router-link>
      </div>
    </Motion>

  </div>
</template>

<script setup>
import { useAuth } from "@/Composables/User/useAuth";
import { useArt } from "../../stores/Art/useArt";
import LazyImage from "../Utilities/LazyImage.vue";

const props = defineProps({
  art: Object,
  ns: String,
});

defineEmits(['open-lightbox']);

const { isAuthed } = useAuth();
const artStore = useArt(props.ns)();

</script>
