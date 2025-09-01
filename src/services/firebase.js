// Firebase core
import { initializeApp } from "firebase/app";

// Realtime Database
import {
    getDatabase, ref, set, get, child, push, update, remove
} from "firebase/database";

// Authentication (Email/Password)
import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    getIdTokenResult
} from "firebase/auth";

// ---- Config da .env (non mettere valori hardcoded) ----
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DB_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ---- Init ----
export const app = initializeApp(firebaseConfig);

// DB
export const db = getDatabase(app);

// AUTH
export const auth = getAuth(app);

// Persistenza: resta loggato dopo refresh (puoi cambiare in SESSION se preferisci)
setPersistence(auth, browserLocalPersistence);

// ---- Auth helpers (solo login/logout/claims; niente createUser!) ----
export async function loginWithEmail(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // opzionale: rinfresca e ritorna anche le claims (ci servirà allo Step 5/9)
    const token = await getIdTokenResult(cred.user, true);
    return { user: cred.user, claims: token.claims };
}

export function onAuthChanged(cb) {
    return onAuthStateChanged(auth, cb);
}

export async function refreshClaims() {
    const u = auth.currentUser;
    if (!u) return null;
    const token = await getIdTokenResult(u, true);
    return token.claims;
}

export async function logout() {
    return signOut(auth);
}

// ---- DB helpers (immutati) ----
export function writeData(path, data) {
    return set(ref(db, path), data);
}

export function pushData(path, data) {
    const newRef = push(ref(db, path));
    return set(newRef, data);
}

export function readData(path) {
    return get(child(ref(db), path));
}

export function updateData(path, data) {
    return update(ref(db, path), data);
}

export function deleteData(path) {
    return remove(ref(db, path));
}

export default db;
