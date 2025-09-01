<template>
  <main class="flex flex-col items-center p-4 h-screen bg-gray-100 overflow-hidden">
    <h1 class="text-2xl font-bold mb-4">Blog</h1>

    <div class="relative w-full max-w-sm h-[70vh]">
      <!-- Stack di card -->
      <div
        v-for="(post, idx) in stackPosts"
        :key="post.id"
        class="absolute inset-0"
        :style="{ zIndex: stackPosts.length - idx }"
      >
        <!-- Card attiva -->
        <div
          v-if="idx === 0"
          class="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden cursor-grab touch-none"
          :style="{ transform: `translate(${position.x}px, ${position.y}px)` }"
          @pointerdown="startDrag"
        >
          <img :src="post.immagine" class="w-full h-48 object-cover" />
          <div class="p-4">
            <h2 class="text-lg font-semibold mb-2">{{ post.titolo }}</h2>
            <p class="text-sm text-gray-700">{{ post.testo }}</p>
          </div>
        </div>

        <!-- Card statiche sotto -->
        <div
          v-else
          class="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden"
          :style="{
            transform: `translateY(${idx * 18}px) scale(${1 - idx * 0.06})`,
            opacity: 1 - idx * 0.1
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

    <!-- Controlli extra -->
    <div class="flex gap-4 mt-6">
      <button @click="prevPost" class="px-4 py-2 bg-gray-300 rounded">Indietro</button>
      <button @click="nextPost" class="px-4 py-2 bg-blue-500 text-white rounded">Avanti</button>
      <button @click="skipPosts(5)" class="px-4 py-2 bg-green-500 text-white rounded">+5</button>
    </div>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue';

// Generiamo 100 post fake


// Stato
const currentIndex = ref(0)

// Stack: mostriamo 5 card da currentIndex
const stackPosts = computed(() =>
  posts.value.slice(currentIndex.value, currentIndex.value + 5)
)

// Drag state
const position = ref({ x: 0, y: 0 })
const startPos = ref({ x: 0, y: 0 })
let dragging = false

// Inizio drag
function startDrag(event) {
  dragging = true
  startPos.value = { x: event.clientX, y: event.clientY }

  window.addEventListener('pointermove', onDrag)
  window.addEventListener('pointerup', endDrag)
}

// Durante drag
function onDrag(event) {
  if (!dragging) return
  const dx = event.clientX - startPos.value.x
  const dy = event.clientY - startPos.value.y
  position.value = { x: dx, y: dy }
}

// Fine drag
function endDrag() {
  dragging = false
  const threshold = 120

  if (position.value.x > threshold) {
    // Swipe verso destra → avanti
    animateOut(1)
  } else if (position.value.x < -threshold) {
    // Swipe verso sinistra → indietro
    animateOut(-1)
  } else {
    // Reset se troppo vicino al centro
    position.value = { x: 0, y: 0 }
  }

  window.removeEventListener('pointermove', onDrag)
  window.removeEventListener('pointerup', endDrag)
}

// Animazione uscita
function animateOut(direction) {
  const card = document.querySelector('.absolute > div')
  if (card) {
    card.animate(
      [
        { transform: `translate(${position.value.x}px, ${position.value.y}px)` },
        {
          transform: `translate(${direction * 500}px, 0)`,
          opacity: 0
        }
      ],
      { duration: 400, easing: 'cubic-bezier(.4,.0,.2,1)', fill: 'forwards' }
    ).onfinish = () => {
      if (direction > 0) {
        nextPost()
      } else {
        prevPost()
      }
    }
  }
}

// Avanza di 1
function nextPost() {
  if (currentIndex.value < posts.value.length - 1) {
    currentIndex.value++
    resetCard()
  }
}

// Torna indietro di 1
function prevPost() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    resetCard()
  }
}

// Salta di N post
function skipPosts(n) {
  currentIndex.value = Math.min(currentIndex.value + n, posts.value.length - 1)
  resetCard()
}

function resetCard() {
  position.value = { x: 0, y: 0 }
}
</script>
