// stores/useArt.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "../../supabase";
import { useAuth } from "../../Composables/User/useAuth";

export const useArt = (namespace) =>
    defineStore(`art-${namespace}`, () => {
        const arts = ref([]);
        const selectedCategory = ref(null);
        const searchQuery = ref('');
        const { isAuthed } = useAuth();

        // Paginazione
        const pageSize = 15;
        const hasMore = ref(true);
        const isLoading = ref(false);

        const fetchArts = async (reset = false) => {
            if (isLoading.value) return;

            if (reset) {
                arts.value = [];
                hasMore.value = true;
            }

            if (!hasMore.value) return;

            isLoading.value = true;
            const from = arts.value.length;
            const to = from + pageSize - 1;

            try {
                const { data, error } = await supabase
                    .from('arts')
                    .select('*', { count: 'exact' })
                    .eq('namespace', namespace)
                    .order('created_at', { ascending: false })
                    .range(from, to);

                if (error) throw error;

                if (data) {
                    if (reset) {
                        arts.value = data;
                    } else {
                        arts.value = [...arts.value, ...data];
                    }
                    if (data.length < pageSize) {
                        hasMore.value = false;
                    }
                }
            } catch (err) {
                console.error(`[fetchArts ${namespace}]`, err.message);
                throw err;
            } finally {
                isLoading.value = false;
            }
        };

        const loadMore = async () => {
            await fetchArts(false);
        };

        const setCategory = (newCategory) => {
            selectedCategory.value = newCategory;
        };

        const categories = computed(() =>
            [...new Set(arts.value.map((a) => a.category))]
        );

        const filteredArts = computed(() => {
            let res = arts.value;
            // Se non è admin, mostra solo quelle pubblicate
            if (!isAuthed.value) {
                res = res.filter((a) => a.is_published !== false);
            }
            if (selectedCategory.value) {
                res = res.filter((a) => a.category === selectedCategory.value);
            }
            if (searchQuery.value) {
                const q = searchQuery.value.toLowerCase();
                res = res.filter((a) =>
                    a.title?.toLowerCase().includes(q) ||
                    a.category?.toLowerCase().includes(q) ||
                    a.description?.toLowerCase().includes(q)
                );
            }
            return res;
        });

        const addArt = async ({ title, category, description, imageFile, is_published = true }) => {
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
                    is_published,
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

        const updateArt = async (id, { title, category, description, imageFile, img_fit, img_position, is_published }) => {
            try {
                let updatedFields = {
                    title,
                    category,
                    description,
                    img_fit: img_fit ?? 'cover',
                    img_position: img_position ?? 'center',
                };
                if (is_published !== undefined) {
                    updatedFields.is_published = is_published;
                }

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
            hasMore,
            isLoading,
            setCategory,
            fetchArts,
            loadMore,
            addArt,
            updateArt,
            removeArt,
            searchQuery,
        };
    });
