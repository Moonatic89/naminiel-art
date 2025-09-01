<template>
  <div v-if="show" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
      <h2 class="text-lg font-semibold mb-4">{{ title }}</h2>
      <p class="text-gray-700 mb-6">{{ message }}</p>

      <div class="flex justify-end gap-3">
        <button @click="$emit('cancel')" class="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">Annulla</button>
        <button @click="$emit('confirm')" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500">Conferma</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: {
    type: String,
    default: "Sei sicuro?"
  },
  message: {
    type: String,
    default: "Questa azione non può essere annullata."
  }
});
</script>
