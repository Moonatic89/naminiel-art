import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "../../supabase";
import { ref as dbRef, push, set, get, child } from "firebase/database";
import db from "../../services/firebase"; // usa direttamente db già configurato

export const useBlog = defineStore("blog", () => {
    // --- Stato iniziale invariato ---

    const posts = ref([]);

    const fetchPosts = async () => {
        try {

            const snapshot = await get(child(dbRef(db), "posts"));
            if (snapshot.exists()) {
                const data = snapshot.val();
                const loadedPosts = Object.entries(data).map(([id, post]) => ({
                    id,
                    ...post,
                })).reverse();
                posts.value = loadedPosts;
            }

        } catch (err) {
            throw err;
        }
    };

    const selectedCategory = ref(null);

    const setCategory = (newCategory) => {
        selectedCategory.value = newCategory;
    };

    const categories = computed(() => [...new Set(posts.value.map((p) => p.category))]);

    const filteredPosts = computed(() => {
        if (!selectedCategory.value) return posts.value;
        return posts.value.filter((p) => p.category === selectedCategory.value);
    });

    // --- Funzione per aggiungere post ---
    const addPost = async ({ title, category, body, imageFile }) => {
        try {
            console.log("[addPost] Inizio procedura per creare un nuovo post...");

            // 1. Randomizza nome file
            const ext = imageFile.name.split('.').pop();
            const randomName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
            console.log(`[addPost] Nome randomizzato per file: ${randomName}`);

            // 2. Upload su Supabase
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('posts') // nome bucket
                .upload(randomName, imageFile);

            console.log("[addPost] Risultato upload Supabase:", { uploadData, uploadError });

            if (uploadError) {
                console.error("[addPost] Errore durante upload su Supabase:", uploadError.message);
                throw uploadError;
            }

            // 3. Ottieni URL pubblico
            const { data: publicUrl } = supabase.storage
                .from('posts')
                .getPublicUrl(randomName);

            console.log("[addPost] URL pubblico generato da Supabase:", publicUrl);

            // 4. Crea oggetto post
            const newPost = {
                title,
                category,
                text: body,
                img: publicUrl.publicUrl,
                created_at: Date.now() // epoch
            };

            console.log("[addPost] Oggetto post pronto per Firebase:", newPost);

            // 5. Salva su Firebase Realtime Database
            console.log("[addPost] Salvataggio su Firebase Realtime Database...");
            const postsRef = dbRef(db, "posts");
            const newPostRef = push(postsRef);
            await set(newPostRef, newPost);
            console.log("[addPost] Post salvato correttamente su Firebase con chiave:", newPostRef.key);

            // 6. Aggiorna localmente
            posts.value.unshift({ id: newPostRef.key, ...newPost });
            console.log("[addPost] Post aggiunto localmente alla lista posts.");

        } catch (err) {
            console.error("[addPost] Errore generale nella funzione addPost:", err);
            throw err;
        }
    };

    // --- Funzione per aggiornare un post ---
    const updatePost = async (id, { title, category, body, imageFile }) => {
        try {
            console.log(`[updatePost] Modifica post con id ${id}...`);

            // 1. Recupera riferimento al post
            const postRef = dbRef(db, `posts/${id}`);
            const snapshot = await get(postRef);
            if (!snapshot.exists()) throw new Error("Post non trovato");

            let updatedData = {
                title,
                category,
                text: body,
            };

            // 2. Se c’è una nuova immagine, caricala su Supabase
            if (imageFile) {
                const ext = imageFile.name.split(".").pop();
                const randomName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
                const { error: uploadError } = await supabase.storage
                    .from("posts")
                    .upload(randomName, imageFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: publicUrl } = supabase.storage
                    .from("posts")
                    .getPublicUrl(randomName);

                updatedData.img = publicUrl.publicUrl;
            }

            // 3. Aggiorna su Firebase
            await set(postRef, { ...snapshot.val(), ...updatedData });

            // 4. Aggiorna localmente nello store
            const index = posts.value.findIndex((p) => p.created_at === snapshot.val().created_at);
            if (index !== -1) posts.value[index] = { ...posts.value[index], ...updatedData };

            console.log("[updatePost] Aggiornamento completato:", updatedData);

        } catch (err) {
            console.error("[updatePost] Errore durante l'update:", err);
            throw err;
        }
    };

    const getPostById = async (id) => {
        const localPost = posts.value.find((p) => p.id === id);
        if (localPost) return localPost;

        const snapshot = await get(child(dbRef(db), `posts/${id}`));
        if (!snapshot.exists()) throw new Error("Post non trovato");
        return { id, ...snapshot.val() };
    };


    // #region Remove
    const deletePost = async (id) => {
        try {
            console.log(`[deletePost] Rimozione post con id ${id}...`);

            // 1. Recupera il post da Firebase
            const postRef = dbRef(db, `posts/${id}`);
            const snapshot = await get(postRef);

            if (!snapshot.exists()) {
                throw new Error("Post non trovato");
            }

            const post = snapshot.val();

            // 2. Se il post ha un'immagine, prova a eliminarla da Supabase
            if (post.img) {
                try {
                    // Estrarre il nome file dall'URL pubblico
                    const parts = post.img.split("/");
                    const fileName = parts[parts.length - 1];

                    const { error: removeError } = await supabase
                        .storage
                        .from("posts")
                        .remove([fileName]);

                    if (removeError) {
                        console.warn("[deletePost] Impossibile rimuovere immagine da Supabase:", removeError.message);
                    } else {
                        console.log("[deletePost] Immagine rimossa da Supabase:", fileName);
                    }
                } catch (err) {
                    console.warn("[deletePost] Errore durante parsing o rimozione immagine:", err);
                }
            }

            // 3. Elimina il post da Firebase
            await set(postRef, null);

            // 4. Aggiorna store locale
            posts.value = posts.value.filter((p) => p.id !== id);

            console.log("[deletePost] Post eliminato con successo.");
        } catch (err) {
            console.error("[deletePost] Errore:", err);
            throw err;
        }
    };

    // #endregion




    return {
        setCategory,
        posts,
        selectedCategory,
        categories,
        filteredPosts,
        addPost,
        fetchPosts,
        updatePost,
        getPostById
    };

});
