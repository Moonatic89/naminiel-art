<template>
  <main class="flex flex-col items-center justify-start p-4 h-screen bg-gray-100 overflow-hidden w-full overflow-hidden">
    <h1 class="text-2xl font-bold mb-6">Blog</h1>

    <div class="relative w-full max-w-sm h-[70vh]">
      <div
        v-for="(post, index) in visiblePosts"
        :key="post.id"
        class="absolute inset-0"
        :style="{ zIndex: visiblePosts.length - index }"
      >
        <!-- Card attiva con swipe -->
        <div
          v-if="index === 0"
          ref="activeCard"
          class="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden cursor-grab touch-none"
          :style="{ transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)` }"
          @pointerdown="startDrag"
        >
          <img :src="post.immagine" class="w-full h-48 object-cover" />
          <div class="p-4">
            <h2 class="text-lg font-semibold mb-2">{{ post.titolo }}</h2>
            <p class="text-sm text-gray-700">{{ post.testo }}</p>
          </div>
        </div>

        <!-- Card sotto (statiche con offset) -->
        <div
          v-else
          class="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden"
          :style="{
            transform: `translateY(${index * 20}px) scale(${1 - index * 0.05}) rotate(${index * 2}deg)`,
            opacity: 1 - index * 0.1
          }"
        >
          <img :src="post.immagine" class="w-full h-48 object-cover" />
          <div class="p-4">
            <h2 class="text-lg font-semibold mb-2">{{ post.titolo }}</h2>
            <p class="text-sm text-gray-700">{{ post.testo }}</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'

// --- Data di esempio ---
const randomImage = (id) => `https://picsum.photos/seed/${id}/400/300`
const posts = ref(
  Array.from({ length: 100 }).map((_, i) => ({
    id: i,
    titolo: `Post ${i + 1}`,
    testo: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    immagine: randomImage(i)
  }))
)

// --- Logica stack ---
const currentIndex = ref(0)
const visiblePosts = computed(() => posts.value.slice(currentIndex.value, currentIndex.value + 5))

// --- Stato drag ---
const position = ref({ x: 0, y: 0 })
const startPos = ref({ x: 0, y: 0 })
const rotation = ref(0)
let dragging = false

function startDrag(event) {
  dragging = true
  startPos.value = { x: event.clientX, y: event.clientY }

  window.addEventListener('pointermove', onDrag)
  window.addEventListener('pointerup', endDrag)
}

function onDrag(event) {
  if (!dragging) return
  const dx = event.clientX - startPos.value.x
  const dy = event.clientY - startPos.value.y
  position.value = { x: dx, y: dy }
  rotation.value = dx * 0.1 // rotazione proporzionale allo swipe
}

function endDrag() {
  dragging = false

  // Se lo swipe è oltre la soglia, rimuovi la card
  if (Math.abs(position.value.x) > 120) {
    animateOut(position.value.x > 0 ? 1 : -1)
  } else {
    // Reset posizione se troppo vicino al centro
    position.value = { x: 0, y: 0 }
    rotation.value = 0
  }

  window.removeEventListener('pointermove', onDrag)
  window.removeEventListener('pointerup', endDrag)
}

function animateOut(direction) {
  const card = document.querySelector('.absolute > div')
  if (card) {
    card.animate(
      [
        {
          transform: `translate(${position.value.x}px, ${position.value.y}px) rotate(${rotation.value}deg)`
        },
        {
          transform: `translate(${direction * 500}px, -100px) rotate(${direction * 45}deg)`,
          opacity: 0
        }
      ],
      { duration: 400, easing: 'ease-in-out', fill: 'forwards' }
    ).onfinish = () => {
      currentIndex.value++
      position.value = { x: 0, y: 0 }
      rotation.value = 0
    }
  }
}
</script>
