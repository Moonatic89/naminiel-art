<template>
  <div class="upload-container">
    <h1>Carica immagine su Supabase</h1>

    <form @submit.prevent="handleUpload">
      <input type="file" accept="image/*" @change="onFileChange" />
      <button type="submit" :disabled="!file || loading">
        {{ loading ? 'Caricamento...' : 'Carica immagine' }}
      </button>
    </form>

    <div v-if="publicUrl" class="result">
      <p>URL immagine:</p>
      <a :href="publicUrl" target="_blank">{{ publicUrl }}</a>
      <img :src="publicUrl" alt="Immagine caricata" class="preview" />
    </div>

    <p v-if="error" class="error">Errore: {{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '../../supabase';
const file = ref(null)
const publicUrl = ref('')
const error = ref('')
const loading = ref(false)

const onFileChange = (e) => {
  file.value = e.target.files[0]
}

const handleUpload = async () => {
  if (!file.value) return
  loading.value = true
  error.value = ''

  try {
    // Nome unico
    const fileName = `${Date.now()}-${file.value.name}`

    // Carica su Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('posts') // Nome bucket
      .upload(fileName, file.value)

    if (uploadError) throw uploadError

    // Ottieni URL pubblico
    const { data } = supabase.storage.from('posts').getPublicUrl(fileName)
    publicUrl.value = data.publicUrl
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style>
.upload-container {
  max-width: 500px;
  margin: 2rem auto;
  text-align: center;
}
.preview {
  max-width: 300px;
  margin-top: 1rem;
}
.error {
  color: red;
  margin-top: 1rem;
}
</style>
