<template>
  <router-link
    :to="to"
    class="nav-item group"
    :class="[hoverClasses, isActive ? activeTextClass : '']"
    :title="label"
  >
    <!-- Dot attivo: top su mobile, left su desktop -->
    <span
      class="nav-dot"
      :class="isActive ? [activeDot, 'nav-dot--active'] : ''"
    />

    <!-- Icona SVG -->
    <component :is="svgIcon" class="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />

    <!-- Label: su mobile sempre visibile accanto, su desktop emerge dal basso su hover/attivo -->
    <span class="nav-label" :class="isActive ? 'nav-label--active' : ''">
      {{ label }}
    </span>
  </router-link>
</template>

<script setup>
import { computed, h } from "vue";
import { useRoute } from "vue-router";

const props = defineProps({
  to: String,
  label: String,
  icon: String,
  color: String,
});

const route = useRoute();
const isActive = computed(() => {
  if (props.to === "/") return route.path === "/";
  return route.path.startsWith(props.to);
});

const colorMap = {
  pink:   { hover: "hover:bg-pink-50   hover:text-pink-500",   active: "text-pink-500",   dot: "bg-pink-400"   },
  rose:   { hover: "hover:bg-rose-50   hover:text-rose-500",   active: "text-rose-500",   dot: "bg-rose-400"   },
  violet: { hover: "hover:bg-violet-50 hover:text-violet-500", active: "text-violet-500", dot: "bg-violet-400" },
  blue:   { hover: "hover:bg-blue-50   hover:text-blue-500",   active: "text-blue-500",   dot: "bg-blue-400"   },
  teal:   { hover: "hover:bg-teal-50   hover:text-teal-500",   active: "text-teal-500",   dot: "bg-teal-400"   },
};

const hoverClasses    = computed(() => colorMap[props.color]?.hover  ?? "hover:bg-gray-100 hover:text-gray-600");
const activeDot       = computed(() => colorMap[props.color]?.dot    ?? "bg-gray-400");
const activeTextClass = computed(() => colorMap[props.color]?.active ?? "text-gray-600");

// SVG custom inline
const svgs = {
  home: () => h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, [
    h("path", { d: "M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" }),
    h("path", { d: "M9 21V12h6v9" }),
  ]),
  blog: () => h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, [
    h("path", { d: "M12 20h9" }),
    h("path", { d: "M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" }),
  ]),
  palette: () => h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, [
    h("path", { d: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" }),
    h("circle", { cx: "8",  cy: "10", r: "1", fill: "currentColor", "stroke-width": "0" }),
    h("circle", { cx: "12", cy: "6",  r: "1", fill: "currentColor", "stroke-width": "0" }),
    h("circle", { cx: "16", cy: "10", r: "1", fill: "currentColor", "stroke-width": "0" }),
  ]),
  star: () => h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, [
    h("polygon", { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" }),
    h("line", { x1: "19", y1: "2",  x2: "20", y2: "4",  "stroke-width": "1.5" }),
    h("line", { x1: "21", y1: "6",  x2: "23", y2: "6",  "stroke-width": "1.5" }),
    h("line", { x1: "19", y1: "10", x2: "20", y2: "8",  "stroke-width": "1.5" }),
  ]),
  person: () => h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, [
    h("circle", { cx: "12", cy: "7", r: "4" }),
    h("path", { d: "M5.5 20a7 7 0 0 1 13 0" }),
  ]),
};

const svgIcon = computed(() => svgs[props.icon] ?? svgs.home);
</script>

<style scoped>
/* ── Base item ─────────────────────────────────────────────────────────────── */
.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 14px;
  transition: all 0.2s;
  color: #9ca3af; /* gray-400 */
  flex-shrink: 0;
}

/* ── Label ─────────────────────────────────────────────────────────────────── */
.nav-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
  line-height: 1;
  /* Mobile: sempre visibile, in riga */
  display: inline;
  opacity: 1;
  max-width: 60px;
  overflow: hidden;
  transition: all 0.2s;
}

/* ── Dot ───────────────────────────────────────────────────────────────────── */
.nav-dot {
  position: absolute;
  border-radius: 9999px;
  opacity: 0;
  transition: all 0.3s;

  /* Mobile: bordo in cima, orizzontale */
  top: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0.5);
  width: 16px;
  height: 3px;
}
.nav-dot--active {
  opacity: 1;
  transform: translateX(-50%) scaleX(1);
}

/* ── Desktop (md+) ─────────────────────────────────────────────────────────── */
@media (min-width: 768px) {
  .nav-item {
    flex-direction: column;
    gap: 2px;
    padding: 8px 8px;
  }

  /* Label: nascosta, emerge su hover o se attiva */
  .nav-label {
    max-width: 0;
    opacity: 0;
    font-size: 9px;
  }
  .nav-item:hover .nav-label,
  .nav-label--active {
    max-width: 60px !important;
    opacity: 1 !important;
  }

  /* Dot: bordo sinistro, verticale */
  .nav-dot {
    top: 50%;
    left: 2px;
    transform: translateY(-50%) scaleY(0.5);
    width: 3px;
    height: 16px;
  }
  .nav-dot--active {
    opacity: 1;
    transform: translateY(-50%) scaleY(1);
  }
}
</style>
