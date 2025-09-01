import { createApp } from 'vue'
import { createPinia } from 'pinia';
import router from './router'
import './style.css'
import App from './App.vue'
import { MotionPlugin } from '@vueuse/motion'
import VueDOMPurifyHTML from 'vue-dompurify-html';
import { onAuthChanged, refreshClaims } from "@/services/firebase";
import { useUserStore } from "@/stores/User/User";

onAuthChanged(async (u) => {
    const store = useUserStore();
    if (!u) {
        store.clearUser();
        return;
    }
    const claims = await refreshClaims().catch(() => ({}));
    store.setUser({
        uid: u.uid,
        email: u.email,
        displayName: u.displayName || null,
        claims: claims || {},
    });
});

const pinia = createPinia();
createApp(App)
    .use(pinia)
    .use(router)
    .use(MotionPlugin)
    .use(VueDOMPurifyHTML, {
        default: {
            ALLOWED_TAGS: ['p', 'b', 'i', 'strong', 'em', 'span', 'br', 'ul', 'ol', 'li'],
            ALLOWED_ATTR: ['class', 'style'],
        }
    })
    // .component('Button', Button)
    .mount('#app');