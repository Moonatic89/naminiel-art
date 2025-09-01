// stores/useArt.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "../../supabase";
import { ref as dbRef, push, set, get, child, remove } from "firebase/database";
import db from "../../services/firebase";

export const useArt = (namespace) =>
    defineStore(`art-${namespace}`, () => {
        const arts = ref([]);
        const selectedCategory = ref(null);

        const fetchArts = async () => {
            try {
                const snapshot = await get(child(dbRef(db), `art-${namespace}`));
                arts.value = snapshot.exists()
                    ? Object.entries(snapshot.val()).map(([id, value]) => ({
                        id,
                        ...value,
                    })).reverse()
                    : [];
            } catch (err) {
                console.error(`[fetchArts ${namespace}]`, err);
                throw err;
            }
        };

        const setCategory = (newCategory) => {
            selectedCategory.value = newCategory;
        };

        const categories = computed(() =>
            [...new Set(arts.value.map((a) => a.category))]
        );

        const filteredArts = computed(() => {
            if (!selectedCategory.value) return arts.value;
            return arts.value.filter((a) => a.category === selectedCategory.value);
        });

        const addArt = async ({ title, category, description, imageFile }) => {
            try {
                const ext = imageFile.name.split(".").pop();
                const randomName = `${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2)}.${ext}`;

                const { error: uploadError } = await supabase.storage
                    .from(`art-${namespace}`)
                    .upload(randomName, imageFile);
                if (uploadError) throw uploadError;

                const { data: publicUrl } = supabase.storage
                    .from(`art-${namespace}`)
                    .getPublicUrl(randomName);

                const newArt = {
                    title,
                    category,
                    description,
                    img: publicUrl.publicUrl,
                    fileName: randomName, // serve se vuoi cancellare anche da Supabase
                    created_at: Date.now(),
                };

                const artsRef = dbRef(db, `art-${namespace}`);
                const newArtRef = push(artsRef);
                await set(newArtRef, newArt);

                arts.value.unshift({ id: newArtRef.key, ...newArt });
            } catch (err) {
                console.error(`[addArt ${namespace}]`, err);
                throw err;
            }
        };

        const removeArt = async (id, fileName = null) => {
            try {
                // Rimuovi dal Realtime Database
                const artRef = dbRef(db, `art-${namespace}/${id}`);
                await remove(artRef);

                // Aggiorna lo stato locale
                arts.value = arts.value.filter((a) => a.id !== id);

                // (Opzionale) rimuovi anche da Supabase se hai salvato il fileName
                if (fileName) {
                    const { error: supaError } = await supabase.storage
                        .from(`art-${namespace}`)
                        .remove([fileName]);
                    if (supaError) throw supaError;
                }
            } catch (err) {
                console.error(`[removeArt ${namespace}]`, err);
                throw err;
            }
        };

        const updateArt = async (id, { title, category, description, imageFile }) => {
            try {
                let imgUrl = null;
                let fileName = null;

                // se viene passato un nuovo file, caricalo su Supabase
                if (imageFile) {
                    const ext = imageFile.name.split(".").pop();
                    const randomName = `${Date.now()}-${Math.random()
                        .toString(36)
                        .substring(2)}.${ext}`;

                    const { error: uploadError } = await supabase.storage
                        .from(`art-${namespace}`)
                        .upload(randomName, imageFile);

                    if (uploadError) throw uploadError;

                    const { data: publicUrl } = supabase.storage
                        .from(`art-${namespace}`)
                        .getPublicUrl(randomName);

                    imgUrl = publicUrl.publicUrl;
                    fileName = randomName;
                }

                // recupero i dati attuali
                const current = arts.value.find((a) => a.id === id);
                if (!current) throw new Error("Art non trovata");

                // oggetto aggiornato
                const updatedArt = {
                    ...current,
                    title: title ?? current.title,
                    category: category ?? current.category,
                    description: description ?? current.description,
                    img: imgUrl || current.img,
                    fileName: fileName || current.fileName,
                    updated_at: Date.now(),
                };

                // aggiorno in Firebase
                const artRef = dbRef(db, `art-${namespace}/${id}`);
                await set(artRef, updatedArt);

                // aggiorno lo stato locale
                arts.value = arts.value.map((a) => (a.id === id ? updatedArt : a));
            } catch (err) {
                console.error(`[updateArt ${namespace}]`, err);
                throw err;
            }
        };


        return {
            arts,
            selectedCategory,
            categories,
            filteredArts,
            setCategory,
            fetchArts,
            addArt,
            removeArt,
        };
    });
