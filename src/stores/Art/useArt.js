// stores/useArt.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "../../supabase";

export const useArt = (namespace) =>
    defineStore(`art-${namespace}`, () => {
        const arts = ref([]);
        const selectedCategory = ref(null);

        const fetchArts = async () => {
            try {
                const { data, error } = await supabase
                    .from('arts')
                    .select('*')
                    .eq('namespace', namespace)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                arts.value = data || [];
            } catch (err) {
                console.error(`[fetchArts ${namespace}]`, err.message);
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

                // 1. Storage
                const { error: uploadError } = await supabase.storage
                    .from(`art-${namespace}`)
                    .upload(randomName, imageFile);
                if (uploadError) throw uploadError;

                const { data: publicUrl } = supabase.storage
                    .from(`art-${namespace}`)
                    .getPublicUrl(randomName);

                // 2. Database
                const newArtData = {
                    title,
                    category,
                    description,
                    img: publicUrl.publicUrl,
                    file_name: randomName,
                    namespace: namespace,
                    created_at: new Date().toISOString(),
                };

                const { data, error } = await supabase
                    .from('arts')
                    .insert([newArtData])
                    .select();

                if (error) throw error;

                if (data) arts.value.unshift(data[0]);
            } catch (err) {
                console.error(`[addArt ${namespace}]`, err.message);
                throw err;
            }
        };

        const removeArt = async (id, fileName = null) => {
            try {
                // 1. Database
                const { error } = await supabase
                    .from('arts')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                // 2. Locale
                arts.value = arts.value.filter((a) => a.id !== id);

                // 3. Storage
                if (fileName) {
                    const { error: supaError } = await supabase.storage
                        .from(`art-${namespace}`)
                        .remove([fileName]);
                    if (supaError) {
                        console.warn(`[removeArt ${namespace}] Errore storage:`, supaError.message);
                    }
                }
            } catch (err) {
                console.error(`[removeArt ${namespace}]`, err.message);
                throw err;
            }
        };

        const updateArt = async (id, { title, category, description, imageFile }) => {
            try {
                let updatedFields = {
                    title,
                    category,
                    description,
                };

                // se viene passato un nuovo file
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

                    updatedFields.img = publicUrl.publicUrl;
                    updatedFields.file_name = randomName;
                }

                const { data, error } = await supabase
                    .from('arts')
                    .update(updatedFields)
                    .eq('id', id)
                    .select();

                if (error) throw error;

                if (data) {
                    arts.value = arts.value.map((a) => (a.id === id ? data[0] : a));
                }
            } catch (err) {
                console.error(`[updateArt ${namespace}]`, err.message);
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
