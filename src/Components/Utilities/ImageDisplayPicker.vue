<template>
  <div class="picker-wrap">
    <p class="picker-label">Visualizzazione immagine</p>

    <!-- Preview live + griglia opzioni -->
    <div class="picker-body">
      <!-- Anteprima -->
      <div class="preview-box">
        <img
          v-if="previewSrc"
          :src="previewSrc"
          alt="Anteprima"
          :style="{ objectFit: modelFit, objectPosition: modelPosition }"
          class="preview-img"
        />
        <div v-else class="preview-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-8 h-8 text-gray-300">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
        <!-- Badge -->
        <span class="preview-badge">{{ modelFit }} · {{ modelPosition }}</span>
      </div>

      <!-- Griglia preset -->
      <div class="options-grid">
        <button
          v-for="opt in presets"
          :key="opt.key"
          class="option-btn"
          :class="{ active: modelFit === opt.fit && modelPosition === opt.position }"
          :title="opt.label"
          @click="select(opt)"
        >
          <!-- Mini preview SVG del preset -->
          <svg viewBox="0 0 40 28" class="opt-svg">
            <!-- Bordo card -->
            <rect x="1" y="1" width="38" height="26" rx="3" fill="#f3f4f6" stroke="#e5e7eb"/>
            <!-- Rappresentazione visiva del fit -->
            <image v-if="previewSrc" :href="previewSrc" v-bind="opt.svgProps" />
            <rect v-else x="8" y="4" width="24" height="20" rx="2" fill="#e5e7eb"/>
            <!-- Indicatore fit -->
            <text x="20" y="22" text-anchor="middle" font-size="5" font-family="sans-serif" fill="#6b7280">{{ opt.label }}</text>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  fit: { type: String, default: "cover" },
  position: { type: String, default: "center" },
  previewSrc: { type: String, default: null },
});

const emit = defineEmits(["update:fit", "update:position"]);

const modelFit      = computed(() => props.fit);
const modelPosition = computed(() => props.position);

const presets = [
  // cover + positions
  {
    key: "cover-center", label: "Centr.", fit: "cover", position: "center",
    svgProps: { x: 1, y: 1, width: 38, height: 26, preserveAspectRatio: "xMidYMid slice" },
  },
  {
    key: "cover-top", label: "Alto", fit: "cover", position: "top",
    svgProps: { x: 1, y: 1, width: 38, height: 26, preserveAspectRatio: "xMidYMin slice" },
  },
  {
    key: "cover-bottom", label: "Basso", fit: "cover", position: "bottom",
    svgProps: { x: 1, y: 1, width: 38, height: 26, preserveAspectRatio: "xMidYMax slice" },
  },
  {
    key: "cover-left", label: "Sin.", fit: "cover", position: "left",
    svgProps: { x: 1, y: 1, width: 38, height: 26, preserveAspectRatio: "xMinYMid slice" },
  },
  {
    key: "cover-right", label: "Des.", fit: "cover", position: "right",
    svgProps: { x: 1, y: 1, width: 38, height: 26, preserveAspectRatio: "xMaxYMid slice" },
  },
  // contain
  {
    key: "contain-center", label: "Intero", fit: "contain", position: "center",
    svgProps: { x: 2, y: 2, width: 36, height: 24, preserveAspectRatio: "xMidYMid meet" },
  },
];

function select(opt) {
  emit("update:fit", opt.fit);
  emit("update:position", opt.position);
}
</script>

<style scoped>
.picker-wrap {
  margin-top: 16px;
}

.picker-label {
  font-size: 0.825rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
}

.picker-body {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}

/* ── Preview box ─────────────── */
.preview-box {
  position: relative;
  width: 160px;
  height: 110px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1.5px solid #e5e7eb;
  background: #f9fafb;
}

.preview-img {
  width: 100%;
  height: 100%;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-badge {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.5);
  color: #fff;
  font-size: 9px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 99px;
  white-space: nowrap;
}

/* ── Options grid ─────────────── */
.options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  flex: 1;
  min-width: 160px;
}

.option-btn {
  padding: 4px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.15s;
}

.option-btn:hover {
  border-color: #ff547e;
  background: #fff1f4;
}

.option-btn.active {
  border-color: #ff547e;
  background: #fff1f4;
  box-shadow: 0 0 0 2px rgba(255, 84, 126, 0.2);
}

.opt-svg {
  width: 100%;
  height: auto;
  display: block;
}
</style>
