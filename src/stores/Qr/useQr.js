// stores/Qr/useQr.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "../../supabase";

export const useQr = defineStore("qr-code", () => {
    const resources = ref([]); // tutte le risorse complete
    const codes = ref([]);     // solo i code estratti

    // Generatore di code alfanumerici
    const generateCode = (length = 15) => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const createUniqueCode = () => {
        let newCode;
        do {
            newCode = generateCode();
        } while (codes.value.includes(newCode));
        return newCode;
    };

    // Recupera risorse dal db Supabase
    const fetchCodes = async () => {
        try {
            const { data, error } = await supabase
                .from('qr_codes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            resources.value = data || [];
            codes.value = (data || []).map(r => r.code);
        } catch (err) {
            console.error("[fetchCodes]", err.message);
            throw err;
        }
    };


    // Aggiungi nuova risorsa su Supabase
    const addCode = async ({ title, text, imageFile }) => {
        try {
            const ext = imageFile.name.split(".").pop();
            const randomName = `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2)}.${ext}`;

            // 1. Upload immagine
            const { error: uploadError } = await supabase.storage
                .from("qr-code")
                .upload(randomName, imageFile);
            if (uploadError) throw uploadError;

            const { data: publicUrl } = supabase.storage
                .from("qr-code")
                .getPublicUrl(randomName);

            // 2. Genera un code univoco
            const uniqueCode = createUniqueCode();

            const newResource = {
                title,
                text,
                image: publicUrl.publicUrl,
                file_name: randomName,
                code: uniqueCode,
                created_at: new Date().toISOString(),
            };

            // 3. Salva su Database Supabase
            const { data, error } = await supabase
                .from('qr_codes')
                .insert([newResource])
                .select();

            if (error) throw error;

            if (data) {
                resources.value.unshift(data[0]);
                codes.value.unshift(uniqueCode);
            }
        } catch (err) {
            console.error("[addCode]", err.message);
            throw err;
        }
    };

    // Rimuovi risorsa da Supabase
    const removeCode = async (id, fileName = null, code = null) => {
        try {
            // 1. Elimina da Database
            const { error } = await supabase
                .from('qr_codes')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // 2. Aggiorna stato locale
            resources.value = resources.value.filter((r) => r.id !== id);
            if (code) {
                codes.value = codes.value.filter((c) => c !== code);
            }

            // 3. Rimuovi da Storage
            if (fileName) {
                const { error: supaError } = await supabase.storage
                    .from("qr-code")
                    .remove([fileName]);
                if (supaError) {
                    console.warn("[removeCode] Errore rimozione storage:", supaError.message);
                }
            }
        } catch (err) {
            console.error("[removeCode]", err.message);
            throw err;
        }
    };

    return {
        resources,
        codes,
        fetchCodes,
        addCode,
        removeCode,
    };
});
