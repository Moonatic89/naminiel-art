import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "../../supabase";

export const useBlog = defineStore("blog", () => {
    const posts = ref([]);

    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            posts.value = data;
        } catch (err) {
            console.error("[fetchPosts] Errore:", err.message);
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

    const addPost = async ({ title, category, body, imageFile }) => {
        try {

            const ext = imageFile.name.split('.').pop();
            const randomName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

            // 1. Upload Storage
            const { error: uploadError } = await supabase.storage
                .from('posts')
                .upload(randomName, imageFile);

            if (uploadError) throw uploadError;

            // 2. Ottieni URL pubblico
            const { data: publicUrl } = supabase.storage
                .from('posts')
                .getPublicUrl(randomName);

            // 3. Salva su Database Supabase
            const { data, error } = await supabase
                .from('posts')
                .insert([
                    {
                        title,
                        category,
                        text: body,
                        img: publicUrl.publicUrl,
                        created_at: new Date().toISOString()
                    }
                ])
                .select();

            if (error) throw error;

            // 4. Aggiorna localmente
            if (data) {
                posts.value.unshift(data[0]);
            }

        } catch (err) {
            console.error("[addPost] Errore:", err.message);
            throw err;
        }
    };

    const updatePost = async (id, { title, category, body, imageFile, img_fit, img_position }) => {
        try {
            let updatedData = {
                title,
                category,
                text: body,
                img_fit: img_fit ?? 'cover',
                img_position: img_position ?? 'center',
            };

            if (imageFile) {
                // Recupera il vecchio file per rimuoverlo dopo l'upload
                const oldPost = posts.value.find(p => p.id === id);
                const oldFileName = oldPost?.img?.split("/").pop() ?? null;

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

                // Rimuovi il vecchio file dallo storage (non bloccante)
                if (oldFileName) {
                    supabase.storage.from("posts").remove([oldFileName]).catch(err =>
                        console.warn("[updatePost] Vecchio file non rimosso:", err.message)
                    );
                }
            }

            const { data, error } = await supabase
                .from('posts')
                .update(updatedData)
                .eq('id', id)
                .select();

            if (error) throw error;

            const index = posts.value.findIndex((p) => p.id === id);
            if (index !== -1 && data) posts.value[index] = data[0];

        } catch (err) {
            console.error("[updatePost] Errore:", err.message);
            throw err;
        }
    };

    const getPostById = async (id) => {
        const localPost = posts.value.find((p) => p.id === id);
        if (localPost) return localPost;

        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    };

    const deletePost = async (id) => {
        try {
            const post = posts.value.find(p => p.id === id);
            if (!post) return;

            // 1. Rimuovi immagine da Storage
            if (post.img) {
                const parts = post.img.split("/");
                const fileName = parts[parts.length - 1];
                await supabase.storage.from("posts").remove([fileName]);
            }

            // 2. Elimina da Database
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', id);

            if (error) throw error;

            posts.value = posts.value.filter((p) => p.id !== id);
        } catch (err) {
            console.error("[deletePost] Errore:", err.message);
            throw err;
        }
    };

    return {
        setCategory,
        posts,
        selectedCategory,
        categories,
        filteredPosts,
        addPost,
        fetchPosts,
        updatePost,
        getPostById,
        deletePost
    };
});
