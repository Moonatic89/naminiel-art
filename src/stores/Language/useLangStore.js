import { useStorage } from '@vueuse/core';
import { ref, reactive } from 'vue';
import { defineStore } from 'pinia';

// Mappa tutti i file sotto /lang/**/ con nome tipo italian.js
const langFiles = import.meta.glob('/src/lang/**/**/*.js');
export const useLangStore = defineStore('lang', () => {
    const language = useStorage('locale', 'italian');
    const translations = reactive({});

    function setLanguage(lang) {
        language.value = lang;
        for (const key in translations) delete translations[key];
    }

    async function loadPath(category, page) {
        const key = `${category}/${page}`;
        if (translations[key]) return;

        const path = `/src/lang/${category}/${page}/${language.value}.js`;
        const importer = langFiles[path];
        if (!importer) {
            console.warn(`Traduzione mancante per: ${key} [${language.value}]`);
            translations[key] = {};
            return;
        }

        const module = await importer();
        translations[key] = module.default;
    }

    async function get(fullPath) {
        const [basePath, section] = fullPath.split('#');
        const [category, page] = basePath.split('/');

        if (!category || !page) {
            console.error(`Path non valido: ${fullPath}`);
            return {};
        }

        await loadPath(category, page);

        const key = `${category}/${page}`;
        const data = translations[key] || {};

        return section ? data[section] || {} : data;
    }

    return {
        language,
        translations,
        setLanguage,
        get,
    };
});
