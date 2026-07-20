<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    src: { type: String, required: true },
    alt: { type: String, default: '' },
    imgClass: { type: [String, Array, Object], default: '' },
    imgStyle: { type: Object, default: () => ({}) },
});

const isLoaded = ref(false);

watch(
    () => props.src,
    () => {
        isLoaded.value = false;
    },
);
</script>

<template>
    <div class="relative overflow-hidden bg-neutral-100">
        <div class="absolute inset-0 bg-neutral-200 transition-opacity duration-500" :class="isLoaded ? 'opacity-0' : 'opacity-100 animate-pulse'" />
        <img
            :src="src"
            :alt="alt"
            loading="lazy"
            class="transition-all duration-500"
            :class="[imgClass, isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm']"
            :style="imgStyle"
            @load="isLoaded = true"
        />
    </div>
</template>
