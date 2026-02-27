// stores/useOrphans.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "../supabase";

export const useOrphans = defineStore("orphans", () => {
    const orphans = ref([]); // { bucket, fileName, publicUrl, size, selected, adopting, status }
    const scanning = ref(false);
    const error = ref(null);

    // Helper: URL pubblica da bucket + filename
    function getPublicUrl(bucket, fileName) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
        return data.publicUrl;
    }

    // Scansiona un singolo bucket e ritorna i file orfani
    async function scanBucket(bucket, namespace = null) {
        // 1. Lista file nello storage
        const { data: files, error: listErr } = await supabase.storage.from(bucket).list("", {
            limit: 1000,
            offset: 0,
        });
        if (listErr) throw listErr;
        if (!files?.length) return [];

        // Filtra i file reali (escludi cartelle o placeholder vuoti)
        const realFiles = files.filter(f => f.name && f.name !== ".emptyFolderPlaceholder");

        // 2. Recupera i filename già registrati nel DB
        let knownNames = new Set();

        if (bucket === "posts") {
            const { data: posts } = await supabase.from("posts").select("img");
            (posts || []).forEach(p => {
                if (p.img) {
                    // Estrai il basename dall'URL
                    const name = p.img.split("/").pop();
                    knownNames.add(name);
                }
            });
        } else {
            // art-og o art-fa
            const query = supabase.from("arts").select("file_name");
            if (namespace) query.eq("namespace", namespace);
            const { data: arts } = await query;
            (arts || []).forEach(a => {
                if (a.file_name) knownNames.add(a.file_name);
            });
        }

        // 3. Filtra orfani
        return realFiles
            .filter(f => !knownNames.has(f.name))
            .map(f => ({
                bucket,
                namespace,
                fileName: f.name,
                publicUrl: getPublicUrl(bucket, f.name),
                size: f.metadata?.size ?? null,
            }));
    }

    // Scansiona tutti i bucket
    async function scanAll() {
        scanning.value = true;
        error.value = null;
        orphans.value = [];

        try {
            const [ogOrphans, faOrphans, postOrphans] = await Promise.all([
                scanBucket("art-og", "og"),
                scanBucket("art-fa", "fa"),
                scanBucket("posts", null),
            ]);

            orphans.value = [
                ...ogOrphans.map(o => ({ ...o, label: "Art OG", adoptType: "art" })),
                ...faOrphans.map(o => ({ ...o, label: "Art FA", adoptType: "art" })),
                ...postOrphans.map(o => ({ ...o, label: "Blog Post", adoptType: "post" })),
            ];
        } catch (err) {
            error.value = err.message;
        } finally {
            scanning.value = false;
        }
    }

    // Adotta come Art (crea record senza re-upload)
    async function adoptAsArt(orphan, { title, category, description }) {
        const { data, error: dbErr } = await supabase
            .from("arts")
            .insert([{
                title,
                category,
                description,
                img: orphan.publicUrl,
                file_name: orphan.fileName,
                namespace: orphan.namespace,
                created_at: new Date().toISOString(),
            }])
            .select();

        if (dbErr) throw dbErr;

        // Rimuovi dalla lista locale
        orphans.value = orphans.value.filter(
            o => !(o.bucket === orphan.bucket && o.fileName === orphan.fileName)
        );
        return data?.[0];
    }

    // Adotta come Blog Post (crea record senza re-upload)
    async function adoptAsBlogPost(orphan, { title, category, body }) {
        const { data, error: dbErr } = await supabase
            .from("posts")
            .insert([{
                title,
                category,
                text: body,
                img: orphan.publicUrl,
                created_at: new Date().toISOString(),
            }])
            .select();

        if (dbErr) throw dbErr;

        orphans.value = orphans.value.filter(
            o => !(o.bucket === orphan.bucket && o.fileName === orphan.fileName)
        );
        return data?.[0];
    }

    // Elimina un orfano dallo storage
    async function deleteOrphan(orphan) {
        const { error: delErr } = await supabase.storage
            .from(orphan.bucket)
            .remove([orphan.fileName]);

        if (delErr) throw delErr;

        orphans.value = orphans.value.filter(
            o => !(o.bucket === orphan.bucket && o.fileName === orphan.fileName)
        );
    }

    return {
        orphans,
        scanning,
        error,
        scanAll,
        adoptAsArt,
        adoptAsBlogPost,
        deleteOrphan,
    };
});
