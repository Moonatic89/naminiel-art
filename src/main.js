import { createApp } from 'vue'
import { createPinia } from 'pinia';
import router from './router'
import './style.css'
import App from './App.vue'
import { MotionPlugin } from '@vueuse/motion'
import VueDOMPurifyHTML from 'vue-dompurify-html';
import { onAuthChanged } from "@/services/auth";
import { useUserStore } from "@/stores/User/User";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);

// Inizializza il listener auth DOPO che pinia è stato installato
onAuthChanged((u) => {
    const store = useUserStore();
    if (!u) {
        store.clearUser();
    } else {
        store.setUser({
            uid: u.id,
            email: u.email,
        });
    }
});

app.use(router)
    .use(MotionPlugin)
    .use(VueDOMPurifyHTML, {
        default: {
            ALLOWED_TAGS: ['p', 'b', 'i', 'strong', 'em', 'span', 'br', 'ul', 'ol', 'li'],
            ALLOWED_ATTR: ['class', 'style'],
        }
    })
    .mount('#app');