<script setup>
import { computed } from 'vue';
import { useLangStore } from '../../stores/Language/useLangStore';

const langStore = useLangStore();

// Alterna tra italiano e inglese
function toggleLanguage() {
  const next = langStore.language === 'italian' ? 'english' : 'italian';
  langStore.setLanguage(next);
}

// Mostra la lingua corrente in modo leggibile
const currentLang = computed(() =>
  langStore.language === 'italian' ? '🇮🇹 Italiano' : '🇬🇧 English'
);
</script>

<template>
  <button @click="toggleLanguage">
    Cambia lingua: {{ currentLang }}
  </button>
</template>

<style scoped>
button {
  padding: 0.5rem 1rem;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  background: #444;
  color: white;
  cursor: pointer;
}
button:hover {
  background: #666;
}
</style>
