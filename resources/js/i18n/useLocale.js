import { computed, ref } from 'vue';
import en from './locales/en';
import it from './locales/it';

const locales = { it, en };
const defaultLocale = 'it';
const storageKey = 'naminiel_locale';

function initialLocale() {
    if (typeof window === 'undefined') {
        return defaultLocale;
    }

    const savedLocale = window.localStorage.getItem(storageKey);

    if (savedLocale && locales[savedLocale]) {
        return savedLocale;
    }

    const browserLocale = window.navigator.language?.slice(0, 2);

    return locales[browserLocale] ? browserLocale : defaultLocale;
}

const currentLocale = ref(initialLocale());

if (typeof document !== 'undefined') {
    document.documentElement.lang = currentLocale.value;
}

export function useLocale() {
    const locale = computed(() => currentLocale.value);
    const messages = computed(() => locales[currentLocale.value]);

    function setLocale(nextLocale) {
        if (!locales[nextLocale]) {
            return;
        }

        currentLocale.value = nextLocale;

        if (typeof window !== 'undefined') {
            window.localStorage.setItem(storageKey, nextLocale);
            document.documentElement.lang = nextLocale;
        }
    }

    return {
        availableLocales: Object.keys(locales),
        locale,
        messages,
        setLocale,
    };
}
