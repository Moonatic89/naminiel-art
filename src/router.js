import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from "@/stores/User/User";
import { onAuthChanged, getSession } from "@/services/auth";

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
        name: 'Edit Post',
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
        name: 'Edit Art',
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
        meta: { guestOnly: true },
    },
    {
        path: '/policy',
        name: 'Policy',
        component: () => import('./Views/Site/Policy.vue'),
    },
    // #region Admin
    {
        path: '/orphans',
        name: 'Orphans',
        component: () => import('./Views/Site/Orphans.vue'),
        meta: { adminOnly: true },
    },
    // #endregion
    // #region 404
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('./Views/Site/NotFound.vue'),
    },
    // #endregion
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Attendi la prima emissione di Auth
let authReady = false;
let initialUser = null;

function waitForAuth() {
    if (authReady) return Promise.resolve(initialUser);
    return new Promise((resolve) => {
        const unsubscribe = onAuthChanged((user) => {
            authReady = true;
            initialUser = user;
            unsubscribe();
            resolve(user);
        });
    });
}

router.beforeEach(async (to, from, next) => {
    const user = await waitForAuth();
    const userStore = useUserStore();

    // se la route è solo per ospiti e l'utente è loggato → manda alla home o area admin
    if (to.meta?.guestOnly && user) {
        return next({ name: "Home" });
    }

    // Se la rotta richiede admin
    const ADMIN_EMAILS = [
        import.meta.env.VITE_ADMIN_EMAIL_01,
        import.meta.env.VITE_ADMIN_EMAIL_02,
    ].filter(Boolean).map(e => e.toLowerCase());
    const isAdmin = user && ADMIN_EMAILS.includes((user.email ?? '').toLowerCase());

    if (to.meta?.adminOnly || to.path.includes('/new') || to.path.includes('/edit') || to.name === 'NewCard') {
        if (!isAdmin) {
            return next({ name: "Home" });
        }
    }

    next();
});

export default router