<template>
  <div class="commission-page">
    
    <!-- Header decorativo -->
    <div class="header-banner">
      <div class="header-overlay"></div>
      <h1 class="page-title">Commissioni APERTE</h1>
      <p class="page-subtitle">Trasformo le tue idee in illustrazioni uniche 🎨✨</p>
    </div>

    <div class="max-w-4xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
      
      <!-- Colonna Sinistra: Listino e Info -->
      <div class="info-section">
        
        <div class="info-card">
          <h2 class="section-title text-emerald-600">
            <svg class="w-6 h-6 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Listino Base
          </h2>
          <div class="price-list">
            <div class="price-item">
              <span class="type">Icon / Busto</span>
              <span class="price">da 25€</span>
            </div>
            <div class="price-item">
              <span class="type">Half Body</span>
              <span class="price">da 40€</span>
            </div>
            <div class="price-item">
              <span class="type">Full Body</span>
              <span class="price">da 60€</span>
            </div>
            <div class="price-item">
              <span class="type">Sfondo Dettagliato</span>
              <span class="price">+ 15-30€</span>
            </div>
            <div class="price-item">
              <span class="type">Personaggio Extra</span>
              <span class="price">+ 50% base</span>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-4 italic">*I prezzi sono indicativi. Verrà fornito un preventivo esatto basato sulla complessità della richiesta.</p>
        </div>

        <div class="info-card mt-6">
          <h2 class="section-title text-gray-800">
            <svg class="w-6 h-6 inline mr-2 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Cosa Disegno (Do & Don't)
          </h2>
          <div class="grid grid-cols-2 gap-4 text-sm mt-3">
            <div>
              <h3 class="font-bold text-green-600 mb-1">👍 SI (Do)</h3>
              <ul class="list-disc pl-4 text-gray-700 space-y-1">
                <li>Fanart (Anime/VG)</li>
                <li>Original Characters (OC)</li>
                <li>Fantasy / D&D</li>
                <li>Gore leggero</li>
              </ul>
            </div>
            <div>
              <h3 class="font-bold text-red-600 mb-1">👎 NO (Don't)</h3>
              <ul class="list-disc pl-4 text-gray-700 space-y-1">
                <li>NSFW estremo/Hardcore</li>
                <li>Mecha complessi</li>
                <li>Hate art / Politica</li>
                <li>Vettoriale / Loghi</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonna Destra: Modulo Richiesta -->
      <div class="form-section">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Richiedi Preventivo</h2>
        <p class="text-sm text-gray-600 mb-6">Compila il modulo o inviami un messaggio su Instagram. Ti risponderò al più presto!</p>
        
        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Il tuo Nome / Nickname *</label>
            <input v-model="form.name" type="text" required class="w-full px-4 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-colors" />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">La tua Email *</label>
            <input v-model="form.email" type="email" required class="w-full px-4 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-colors" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo di Commissione</label>
            <select v-model="form.type" class="w-full px-4 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-colors">
              <option value="Icon/Bust">Icon / Busto</option>
              <option value="Halfbody">Half Body</option>
              <option value="Fullbody">Full Body</option>
              <option value="Altro">Altro / Da definire</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descrizione dell'idea *</label>
            <textarea v-model="form.description" rows="5" required placeholder="Descrivi posa, mood, dettagli importanti e se hai reference image..." class="w-full px-4 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-colors resize-y"></textarea>
          </div>

          <button type="submit" class="w-full py-3 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 mt-2">
            Invia Richiesta
          </button>
        </form>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const form = ref({
  name: '',
  email: '',
  type: 'Halfbody',
  description: ''
});

// Per ora usa mailto:, ma strutturato per poter aggiungere EmailJS o una Edge Function in seguito
const submitForm = () => {
  const subject = encodeURIComponent(`Richiesta Commissione: ${form.value.type} - da ${form.value.name}`);
  const body = encodeURIComponent(`
Nome: ${form.value.name}
Email Contatto: ${form.value.email}
Tipo: ${form.value.type}

Descrizione:
${form.value.description}
  `);

  // Sostituire con l'email reale dell'artista. Uso un placeholder generico.
  window.location.href = `mailto:naminiel@gmail.com?subject=${subject}&body=${body}`;
};
</script>

<style scoped>
.commission-page {
  min-height: 100vh;
  background-color: #fafafa;
  /* padding-top per coprire sotto la navbar mobile trasparente,
     ma qui usiamo un banner decorativo in cima che deve stare "sotto" la navbar */
}

.header-banner {
  position: relative;
  height: 280px;
  background-image: url('https://hqbmfndntgzbgprrbrhm.supabase.co/storage/v1/object/public/nav/nav_martedi.webp'); /* Un'immagine artistica esistente per atmosfera */
  background-size: cover;
  background-position: center 20%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  padding: 0 20px;
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.7));
}

.page-title {
  position: relative;
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 8px rgba(0,0,0,0.5);
}

.page-subtitle {
  position: relative;
  font-size: 1.1rem;
  font-weight: 500;
  opacity: 0.9;
}

@media (max-width: 767px) {
  .header-banner {
    /* Evita che il testo finisca sotto la navbar mobile */
    padding-top: 60px; 
  }
  .page-title { font-size: 2rem; }
}

/* ── Cards ─────────────────────────────────────────────────────────────────── */
.info-card {
  background: white;
  border-radius: 1.25rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  border: 1px solid #f3f4f6;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 0.75rem;
}

.price-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px dashed #e5e7eb;
}
.price-item:last-child {
  border-bottom: none;
}

.price-item .type {
  font-weight: 600;
  color: #374151;
}

.price-item .price {
  font-weight: 700;
  color: #10b981; /* emerald-500 */
}

/* ── Form ──────────────────────────────────────────────────────────────────── */
.form-section {
  background: white;
  border-radius: 1.25rem;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.05);
  border: 1px solid #f3f4f6;
}
</style>
