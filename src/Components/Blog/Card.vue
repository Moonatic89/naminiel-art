<script setup lang="tsx">
/** @jsxImportSource vue */
import { useAuth } from "@/Composables/User/useAuth";
import { motion } from "motion-v";
import { useBlog } from "../../stores/Blog/Blog";

const blog = useBlog();

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

const cardVariants = {
  offscreen: {
    y: 300,
  },
  onscreen: {
    y: 50,
    rotate: window.innerWidth < 768 ? -3 : -5,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8,
    },
  },
};

const formatDate = (epoch) => {
  const date = new Date(epoch); // Se l'epoch è in secondi, moltiplichi per 1000
  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// #region Auth
const { isAuthed } = useAuth();

// #endregion
</script>

<template>
  <motion.div class="max-w-3xl mx-auto shadow-xl overflow-hidden bg-gray-100 rounded-xl" initial="offscreen" while-in-view="onscreen" :variants="cardVariants" :in-view-options="{ amount: 0.0 }">
    <div name="card-header" class="rounded-t-xl bg-gray-100 pt-4 px-4">
      <div class="flex">
        <h2 class="text-xl font-bold mb-2 w-full flex gap-2">
          {{ post.title }} -
          <span class="animate-pulse" @click="blog.setCategory(post.category)"> {{ post.category }} - </span>
          <span>{{ formatDate(post.created_at) }}</span>
          <div class="ml-auto cursor-pointer" v-if="isAuthed">
            <router-link :to="`/post/edit/${post.id}`"><i class="fa-solid fa-pen-to-square"></i></router-link>
          </div>
        </h2>
      </div>
    </div>

    <div name="card-body" class="rounded-b-xl bg-gray-100 pb-4 px-4 max-h-[350px] md:max-h-[550px] overflow-y-auto">
      <img :src="post.img" alt="Immagine del post" class="float-left mr-4 mb-2 w-48 h-48 object-cover rounded-lg" />

      <div class="text-gray-700 prose prose-rose max-w-none" v-dompurify-html="post.text"></div>
    </div>
  </motion.div>
</template>
