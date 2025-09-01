// stores/Qr/useQr.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "../../supabase";
import { ref as dbRef, push, set, get, child, remove } from "firebase/database";
import db from "../../services/firebase";

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

    // Recupera risorse dal db
    const fetchCodes = async () => {
        try {
            const snapshot = await get(dbRef(db, "qr-code"));
            if (snapshot.exists()) {
                const arr = Object.entries(snapshot.val()).map(([id, value]) => ({
                    id,
                    ...value,
                })).reverse();
                resources.value = arr;
                codes.value = arr.map(r => r.code);
            } else {
                resources.value = [];
                codes.value = [];
            }
        } catch (err) {
            console.error("[fetchCodes]", err);
            throw err;
        }
    };


    // Aggiungi nuova risorsa
    const addCode = async ({ title, text, imageFile }) => {
        try {
            const ext = imageFile.name.split(".").pop();
            const randomName = `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2)}.${ext}`;

            // Upload immagine
            const { error: uploadError } = await supabase.storage
                .from("qr-code")
                .upload(randomName, imageFile);
            if (uploadError) throw uploadError;

            const { data: publicUrl } = supabase.storage
                .from("qr-code")
                .getPublicUrl(randomName);

            // genera un code univoco
            const uniqueCode = createUniqueCode();

            const newResource = {
                title,
                text,
                image: publicUrl.publicUrl,
                fileName: randomName,
                code: uniqueCode,
                created_at: Date.now(),
            };

            const codesRef = dbRef(db, "qr-code");
            const newRef = push(codesRef);
            await set(newRef, newResource);

            resources.value.unshift({ id: newRef.key, ...newResource });
            codes.value.unshift(uniqueCode);
        } catch (err) {
            console.error("[addCode]", err);
            throw err;
        }
    };

    // Rimuovi risorsa
    const removeCode = async (id, fileName = null, code = null) => {
        try {
            const codeRef = dbRef(db, `qr-code/${id}`);
            await remove(codeRef);

            resources.value = resources.value.filter((r) => r.id !== id);
            if (code) {
                codes.value = codes.value.filter((c) => c !== code);
            }

            if (fileName) {
                const { error: supaError } = await supabase.storage
                    .from("qr-code")
                    .remove([fileName]);
                if (supaError) throw supaError;
            }
        } catch (err) {
            console.error("[removeCode]", err);
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
