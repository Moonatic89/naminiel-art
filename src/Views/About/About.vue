<template>
  <div class="about-page">

    <!-- Background decorativo -->
    <div class="about-bg" aria-hidden="true">
      <div class="blob blob-1" />
      <div class="blob blob-2" />
    </div>

    <!-- Contenuto centrato -->
    <div class="about-content">

      <!-- Avatar / Header -->
      <div class="about-header">
        <div class="avatar-ring">
          <img
            src="https://hqbmfndntgzbgprrbrhm.supabase.co/storage/v1/object/public/nav/nav_venerdi.webp"
            alt="NaminielArt"
            class="avatar-img"
          />
        </div>
        <h1 class="about-name">NaminielArt</h1>
        <p class="about-bio">
          She/Her · QilinQueen 🐉🦄 · 🇮🇹 94<br>
          Mangaka 👩‍🎨 · Gamer 🎮 · Commission open 🎁
        </p>
      </div>

      <!-- Link cards -->
      <div class="links-list">
        <a
          v-for="link in links"
          :key="link.url"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="link-card"
          :style="{ '--accent': link.color }"
        >
          <span class="link-icon" v-html="link.icon" />
          <span class="link-label">{{ link.label }}</span>
          <span class="link-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        </a>
      </div>

    </div>
  </div>
</template>

<script setup>
const links = [
  {
    label: "Solcatempo — Il Battito di Vestara 📖",
    url: "https://amzn.eu/d/1s9gbpg",
    color: "#f59e0b",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>`,
  },
  {
    label: "Heram — fumetto City Land Comix 🤖🔥",
    url: "https://www.citylandcomix.com/product/heram",
    color: "#ef4444",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <path d="M9 9h1v6H9zM15 9h-1v6h1z"/>
      <path d="M9 12h6"/>
    </svg>`,
  },
  {
    label: "Instagram 🦄",
    url: "https://www.instagram.com/naminiel_art/",
    color: "#e1306c",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
    </svg>`,
  },
  {
    label: "Ko-fi — Offrimi una cioccolata ☕",
    url: "https://ko-fi.com/naminielart",
    color: "#2980b9",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
      <line x1="6" y1="1" x2="6" y2="4"/>
      <line x1="10" y1="1" x2="10" y2="4"/>
      <line x1="14" y1="1" x2="14" y2="4"/>
    </svg>`,
  },
  {
    label: "Facebook 🌍",
    url: "https://www.facebook.com/NaminielArt",
    color: "#1877f2",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>`,
  },
  {
    label: "TikTok 🖌️🎼",
    url: "https://www.tiktok.com/@naminielart",
    color: "#010101",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
    </svg>`,
  },
  {
    label: "Discord — Drakkar di Naminiel ⚔️🎨",
    url: "https://discord.gg/5FSbhStx",
    color: "#5865f2",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/>
      <path d="M7.5 7.5C9 7 10.5 6.5 12 6.5s3 .5 4.5 1"/>
      <path d="M7.5 16.5C9 17 10.5 17.5 12 17.5s3-.5 4.5-1"/>
      <path d="M5 5c-1 3-1.5 6-1.5 7S4 14 5 16l2 2h10l2-2c1-2 1.5-4 1.5-4S20 8 19 5l-2-1.5c-1.5.5-3 .5-5 .5s-3.5 0-5-.5L5 5z"/>
    </svg>`,
  },
];
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────────────────────────────────── */
.about-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 16px 40px; /* top: compensa navbar mobile */
  position: relative;
  overflow: hidden;
  background: #fdf4f7;
}

@media (min-width: 768px) {
  .about-page {
    padding: 40px 16px;
  }
}

/* ── Background blobs ───────────────────────────────────────────────────────── */
.about-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.25;
}
.blob-1 {
  width: 500px; height: 500px;
  background: #ff547e;
  top: -120px; left: -120px;
}
.blob-2 {
  width: 400px; height: 400px;
  background: #5bc6d8;
  bottom: -100px; right: -100px;
}

/* ── Content ────────────────────────────────────────────────────────────────── */
.about-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* ── Header ─────────────────────────────────────────────────────────────────── */
.about-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.avatar-ring {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(135deg, #ff547e, #5bc6d8);
  box-shadow: 0 8px 32px rgba(255, 84, 126, 0.3);
}
.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background: #fff;
}

.about-name {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1f2937;
  letter-spacing: -0.02em;
}

.about-bio {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.6;
}

/* ── Link cards ─────────────────────────────────────────────────────────────── */
.links-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.link-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: #fff;
  border-radius: 16px;
  border: 1.5px solid #f3f4f6;
  text-decoration: none;
  color: #1f2937;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  position: relative;
  overflow: hidden;
}

.link-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--accent, #ff547e);
  border-radius: 4px 0 0 4px;
  transition: width 0.2s ease;
}

.link-card:hover {
  transform: translateX(4px);
  border-color: var(--accent, #ff547e);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.link-card:hover::before {
  width: 6px;
}

.link-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  color: var(--accent, #ff547e);
  display: flex;
  align-items: center;
  justify-content: center;
}
.link-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.link-label {
  flex: 1;
}

.link-arrow {
  color: #d1d5db;
  flex-shrink: 0;
  transition: color 0.2s, transform 0.2s;
}

.link-card:hover .link-arrow {
  color: var(--accent, #ff547e);
  transform: translateX(2px);
}
</style>
