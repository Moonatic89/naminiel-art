<script setup>
const props = defineProps({
    image: {
        type: Object,
        default: null,
    },
    gradientClass: {
        type: [String, Array, Object],
        default: '',
    },
    frameClass: {
        type: [String, Array, Object],
        default: '',
    },
    timerSection: {
        type: String,
        default: null,
    },
});

const emit = defineEmits(['open-image', 'pause-timer', 'resume-timer']);

function updateTilt(event) {
    if (!props.image?.src) {
        return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 12;
    const rotateX = (0.5 - y) * 12;

    event.currentTarget.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
    event.currentTarget.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
    event.currentTarget.style.setProperty('--glow-x', `${(x * 100).toFixed(1)}%`);
    event.currentTarget.style.setProperty('--glow-y', `${(y * 100).toFixed(1)}%`);
}

function pauseTimer() {
    emit('pause-timer', props.timerSection);
}

function resumeTimer(event) {
    event.currentTarget.style.setProperty('--tilt-x', '0deg');
    event.currentTarget.style.setProperty('--tilt-y', '0deg');
    emit('resume-timer', props.timerSection);
}

function openImage() {
    if (!props.image?.src) {
        return;
    }

    emit('open-image', {
        src: props.image.src,
        alt: props.image.alt || '',
        timerSection: props.timerSection,
    });
}
</script>

<template>
    <button
        type="button"
        class="home-image-frame image-tilt-surface relative overflow-hidden bg-gradient-to-br text-left"
        :class="[frameClass, image ? '' : gradientClass]"
        :disabled="!image?.src"
        @click="openImage"
        @pointerenter="pauseTimer"
        @pointermove="updateTilt"
        @pointerleave="resumeTimer"
        @focus="pauseTimer"
        @blur="resumeTimer"
    >
        <img
            v-if="image?.src"
            :src="image.src"
            :alt="image.alt || ''"
            loading="lazy"
            class="image-tilt-media h-full w-full object-cover"
            :style="{
                objectFit: image.fit || 'cover',
                objectPosition: image.position || 'center',
            }"
        />
    </button>
</template>

<style scoped>
.home-image-frame {
    display: block;
    width: 100%;
    border: 0;
    color: inherit;
    cursor: zoom-in;
    perspective: 900px;
    transform-style: preserve-3d;
}

.home-image-frame:disabled {
    cursor: default;
}

.image-tilt-media {
    transform: rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) translateZ(0);
    transition:
        transform 180ms ease,
        filter 180ms ease;
}

.home-image-frame::after {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: '';
    background: radial-gradient(circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(255, 255, 255, 0.28), transparent 34%);
    opacity: 0;
    transition: opacity 180ms ease;
    mix-blend-mode: screen;
}

.home-image-frame:hover::after,
.home-image-frame:focus-visible::after {
    opacity: 1;
}

.home-image-frame:hover .image-tilt-media,
.home-image-frame:focus-visible .image-tilt-media {
    filter: saturate(1.08) contrast(1.03);
}
</style>
