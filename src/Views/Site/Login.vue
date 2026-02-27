<script setup>
import { loginWithEmail, logout } from "@/services/auth";
import { useUserStore } from "@/stores/User/User";
import { ref } from "vue";
import { useRouter } from "vue-router";

const userStore = useUserStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const ADMIN_EMAIL = "moonatic1989@gmail.com";

async function login() {
  error.value = "";
  loading.value = true;
  try {
    const { user } = await loginWithEmail(email.value.trim(), password.value);
    
    if ((user.email ?? "") !== ADMIN_EMAIL) {
      await logout();
      throw new Error("Questo account non è autorizzato.");
    }

    userStore.setUser({
      uid: user.id,
      email: user.email,
    });
    
    router.push("/");
  } catch (e) {
    console.error(e);
    error.value = e.message || "Errore di accesso.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="flex flex-col justify-center min-h-screen px-6 bg-gray-50">
    <div class="max-w-sm w-full mx-auto">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-900">Accedi</h1>

      <!-- Email -->
      <input v-model="email" type="email" placeholder="Email" class="w-full px-4 py-3 mb-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" autocomplete="username" />

      <!-- Password -->
      <input v-model="password" type="password" placeholder="Password" class="w-full px-4 py-3 mb-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" autocomplete="current-password" />
      <p v-if="error" class="text-red-500 text-sm text-center mb-4">{{ error }}</p>

      <button @click="login" :disabled="loading" class="w-full py-3 mb-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
        {{ loading ? "Caricamento..." : "Login" }}
      </button>
    </div>
  </main>
</template>
