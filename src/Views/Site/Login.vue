<script setup>
import { auth, loginWithEmail } from "@/services/firebase"; // funzione creata nello step 2B
import { useUserStore } from "@/stores/User/User";
import { signOut } from "firebase/auth";
import { ref } from "vue";
import { useRouter } from "vue-router";

const userStore = useUserStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

// (opzionale) whitelisting duro dell'email admin finché non mettiamo le claims
const ADMIN_EMAIL = "moonatic1989@gmail.com";

async function login() {
  error.value = "";
  loading.value = true;
  try {
    const { user, claims } = await loginWithEmail(email.value.trim(), password.value);
    if ((user.email ?? "") !== ADMIN_EMAIL) {
      await signOut(auth);
      throw new Error("Questo account non è autorizzato.");
    }
    // salva info minime nello store (id/email); niente password
    userStore.setUser({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      claims: claims || {},
    });
    router.push("/"); // rotta protetta (step 9)
  } catch (e) {
    const code = e?.code ?? "";
    if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
      error.value = "Credenziali non valide.";
    } else if (code === "auth/too-many-requests") {
      error.value = "Troppi tentativi. Riprova più tardi.";
    } else if (e?.message) {
      error.value = e.message;
    } else {
      error.value = "Errore di accesso.";
    }
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
