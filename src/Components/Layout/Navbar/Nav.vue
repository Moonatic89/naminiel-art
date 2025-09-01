<template>
  <div class="absolute top-0 right-0 z-50">
    <!-- <div>Username: {{ username }}</div> -->

    <div class="flex gap-x-2 items-center">
      <!-- Bottone logout: mostrato solo se autenticato -->
      <button v-if="isAuthed" @click="onLogout" :disabled="loggingOut" title="Esci" aria-label="Logout"><i class="fa-solid fa-arrow-right-from-bracket"></i>Logout</button>

      <div v-for="(link, i) in links" :key="i">
        <router-link :to="`/${link.name}`">
          <i :class="icons(link.label)"></i>
          {{ link.label }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from "@/Composables/User/useAuth";
import { logout } from "@/services/firebase"; // già definito nel tuo modulo
import { useUserStore } from "@/stores/User/User";
import { ref } from "vue";
import { useRouter } from "vue-router";

const { isAuthed } = useAuth();

const router = useRouter();
const userStore = useUserStore();

const loggingOut = ref(false);

async function onLogout() {
  if (loggingOut.value) return;
  loggingOut.value = true;
  try {
    await logout();
    userStore.clearUser();
    router.push({ name: "PublicPosts" }); // o la tua rotta pubblica preferita
  } finally {
    loggingOut.value = false;
  }
}

const links = ref([
  { name: "", label: "Home" },
  { name: "blog", label: "Blog" },
  { name: "about", label: "About" },
  { name: "contact", label: "Contact" },
]);

const icons = (label) => {
  switch (label) {
    case "Home":
      return "fa-solid fa-house";
    case "Blog":
      return "fa-solid fa-blog";
    case "NewPost":
      return "fa-solid fa-envelope";
    case "About":
      return "fa-solid fa-user";
    case "Contact":
      return "fa-solid fa-envelope";
    default:
      return "fa-solid fa-circle";
  }
};
</script>

<style scoped>
/* esempio base, aggiusta come vuoi */
.router-link-active {
  font-weight: bold;
}
</style>
