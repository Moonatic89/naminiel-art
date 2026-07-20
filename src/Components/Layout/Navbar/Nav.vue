<template>
  <!-- Mobile: barra orizzontale in cima | md+: pill verticale a destra -->
  <nav class="navbar-shell bg-white/80 backdrop-blur-md shadow-xl border border-white/60">

    <!-- Link di navigazione -->
    <NavItem v-for="item in navItems" :key="item.to" v-bind="item" />

    <!-- Separatore -->
    <div class="separator" />

    <!-- Logout (solo se loggato) -->
    <button
      v-if="isAuthed"
      @click="onLogout"
      :disabled="loggingOut"
      title="Esci"
      class="group flex flex-col md:flex-row items-center gap-1 py-2 px-2 rounded-2xl transition-all duration-200 hover:bg-red-50 text-gray-400 hover:text-red-500"
    >
      <svg class="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span class="text-[9px] font-medium uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-150 md:hidden">Esci</span>
    </button>

  </nav>
</template>

<script setup>
import { useAuth } from "@/Composables/User/useAuth";
import { logout } from "@/services/auth";
import { useUserStore } from "@/stores/User/User";
import { ref } from "vue";
import { useRouter } from "vue-router";
import NavItem from "./NavItem.vue";

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
    router.push("/");
  } catch (err) {
    console.error("Errore durante il logout:", err);
  } finally {
    loggingOut.value = false;
  }
}

const navItems = [
  { to: "/",       label: "Home",     icon: "home",    color: "pink"   },
  { to: "/blog",   label: "Blog",     icon: "blog",    color: "rose"   },
  { to: "/art-og", label: "Original", icon: "palette", color: "violet" },
  { to: "/art-fa", label: "Fan Art",  icon: "star",    color: "blue"   },
  { to: "/about",  label: "About",    icon: "person",  color: "teal"   },
];
</script>

<style scoped>
/* Mobile: barra orizzontale in cima */
.navbar-shell {
  position: fixed;
  z-index: 50;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 0;
}

.separator {
  width: 1px;
  height: 24px;
  background: #e5e7eb;
  margin: 0 4px;
}

/* Desktop: pill verticale a destra, centrata verticalmente */
@media (min-width: 768px) {
  .navbar-shell {
    top: 50%;
    left: auto;
    right: 20px;
    width: auto;
    transform: translateY(-50%);
    flex-direction: column;
    padding: 16px 12px;
    border-radius: 24px;
  }

  .separator {
    width: 24px;
    height: 1px;
    margin: 4px 0;
  }
}
</style>
