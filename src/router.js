import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from "@/stores/User/User";
import { auth, refreshClaims, onAuthChanged } from "@/services/firebase";

const routes = [
    // #region Home
    {
        path: '/',
        name: 'Home',
        component: () => import('./Views/Site/Home.vue'),
    },
    // #endregion
    // #region Blog
    {
        path: '/blog',
        name: 'Blog',
        component: () => import('./Views/Blog/Blog.vue'),
    },
    {
        path: '/post/new',
        name: 'New Post',
        component: () => import('./Views/Blog/NewPost.vue'),
    },
    {
        path: '/post/edit/:id',
        name: 'New Post',
        component: () => import('./Views/Blog/EditPost.vue'),
        props: route => ({ id: route.params.id })
    },
    // #endregion
    // #region Art
    {
        path: '/art-:ns',
        name: 'Art',
        component: () => import('./Views/Art/List.vue'),
        props: route => ({ namespace: route.params.ns })
    },
    {
        path: '/art-:ns/new',
        name: 'NewArt',
        component: () => import('./Views/Art/NewArt.vue'),
        props: route => ({ namespace: route.params.ns })
    },
    {
        path: '/art-:ns/edit/:id',
        name: 'New Art',
        component: () => import('./Views/Art/EditArt.vue'),
        props: route => ({ namespace: route.params.ns, id: route.params.id })
    },
    // #endregion
    // #region QR
    {
        path: '/cards/:code',
        name: 'Cards',
        component: () => import('./Views/Qr/Qr.vue'),
        props: route => ({ namespace: route.params.code })
    },
    {
        path: '/newCard',
        name: 'NewCard',
        component: () => import('./Views/Qr/NewCard.vue'),
    },
    // #endregion
    // #region Extra
    {
        path: '/about',
        name: 'About',
        component: () => import('./Views/About/About.vue'),
    },

    // #endregion
    // #region Login
    {
        path: '/pamina',
        name: 'Login',
        component: () => import('./Views/Site/Login.vue'),
        meta: { guestOnly: true }, // se già loggato, non mostrare la login
    },
    {
        path: '/policy',
        name: 'Policy',
        component: () => import('./Views/Site/Policy.vue'),
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Attendi la prima emissione di Auth (evita condizioni di gara)
let authReady = false;
function waitForAuth() {
    if (authReady) return Promise.resolve();
    return new Promise((resolve) => {
        const off = onAuthChanged(() => {
            authReady = true;
            off();
            resolve();
        });
    });
}

router.beforeEach(async (to, from, next) => {
    await waitForAuth();

    const user = auth.currentUser;

    // se la route è solo per ospiti e l'utente è loggato → manda all'area admin
    if (to.meta?.guestOnly && user) {
        return next({ name: "AdminPosts" });
    }

    // se richiede login e non c'è utente → NON mandare alla login, vai al fallback/public
    if (to.meta?.requiresAuth && !user) {
        const fb = to.meta?.fallback || { name: "PublicPosts" };
        return next(fb);
    }

    // se richiede admin, controlla la claim
    if (to.meta?.requiresAdmin) {
        const store = useUserStore();
        let claims = store.user?.claims;
        if (user && (!claims || !claims.role)) {
            claims = await refreshClaims().catch(() => ({}));
            store.setUser({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || null,
                claims: claims || {},
            });
        }
        if (claims?.role !== "admin") {
            const fb = to.meta?.fallback || { name: "PublicPosts" };
            return next(fb);
        }
    }

    next();
});

export default router
