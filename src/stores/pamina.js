import { defineStore } from 'pinia';
import { ref, onMounted } from 'vue';
import { API_TOKEN } from "../config";
import axios from "axios";
import { useLocalStorage } from '@vueuse/core';

export const usePaminaStore = defineStore('pamina', () => {
    const events = ref([]);
    const products = ref([]);
    const sales = ref([]);
    const currentSelection = useLocalStorage("currentSelection", "NewEvent");
    const loaded = ref(false);
    const transitionName = ref("slide-left");
    const saveProcess = ref(false)

    // #region Duplication
    const duplicateFound = ref(false);

    const setDuplication = (newValue) => {
        duplicateFound.value = newValue
    }
    // #endregion

    const transitionMap = {
        "NewEvent-NewProduct": "slide-left",
        "NewProduct-ProductList": "flip",
        "ProductList-NewProduct": "flip",
        "EventList-NewEvent": "flip",
        "NewEvent-Shop": "slide-left",
        "NewEvent-EventList": "flip",
        "NewProduct-Shop": "slide-left",
        "NewProduct-NewEvent": "slide-right",
        "Shop-NewEvent": "slide-right",
        "Shop-NewProduct": "slide-right",
        "Shop-SellList": "flip",
        "EventList-NewProduct": "slide-left",
        "EventList-Shop": "slide-left",
        "ProductList-NewEvent": "slide-right",
        "ProductList-Shop": "slide-left",
        "SellList-Shop": "flip",
    };

    const generateId = () => `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const setSelection = (newSelection) => {
        if (newSelection !== currentSelection.value) {
            const transitionKey = `${currentSelection.value}-${newSelection}`;
            transitionName.value = transitionMap[transitionKey] || "slide-left";
            currentSelection.value = newSelection;
        };
    };

    const addInstance = (key, instance) => {
        saveProcess.value = true;

        const newId = generateId();
        instance.id = newId;

        switch (key) {
            case 'Event': {
                const isDuplicate = events.value.some(e =>
                    e.name === instance.name &&
                    e.location === instance.location &&
                    e.dates?.start === instance.dates?.start &&
                    e.dates?.end === instance.dates?.end
                );
                if (isDuplicate) {
                    duplicateFound.value = true;
                    return;
                }

                duplicateFound.value = false;
                events.value.push({ ...instance });
                break;
            }

            case 'Product': {
                const isDuplicate = products.value.some(p =>
                    p.dimension === instance.dimension &&
                    p.subject === instance.subject &&
                    p.qty === instance.qty &&
                    p.type === instance.type &&
                    p.price === instance.price
                );
                if (isDuplicate) {
                    duplicateFound.value = true;
                    return;
                }

                duplicateFound.value = false;
                products.value.push({ ...instance });
                break;
            }

            case 'Sell':
                sales.value.push({ ...instance });
                break;

            default:
                break;
        }

        saveData();
    };

    const editInstance = (key, instance) => {
        switch (key) {
            case 'Event': {
                const index = events.value.findIndex((e) => e.id === instance.id);
                if (index === -1) return;

                const isDuplicate = events.value.some(e =>
                    e.id !== instance.id &&
                    e.name === instance.name &&
                    e.location === instance.location &&
                    e.dates.start === instance.dates.start &&
                    e.dates.end === instance.dates.end
                );

                if (isDuplicate) {
                    duplicateFound.value = true;
                    return;
                }

                duplicateFound.value = false;
                events.value[index] = JSON.parse(JSON.stringify(updatedEvent));
                break;
            }

            case 'Product': {
                const index = products.value.findIndex((p) => p.id === instance.id);
                if (index === -1) return;

                const isDuplicate = products.value.some(p =>
                    p.id !== instance.id &&
                    p.dimension === instance.dimension &&
                    p.subject === instance.subject &&
                    p.qty === instance.qty &&
                    p.type === instance.type &&
                    p.price === instance.price
                );

                if (isDuplicate) {
                    duplicateFound.value = true;
                    return;
                }

                duplicateFound.value = false;
                products.value[index] = JSON.parse(JSON.stringify(updatedProduct));
                break;
            }

            default:
                break;
        }

        saveData();
    };

    const removeInstance = (key, id) => {
        switch (key) {
            case 'Event':
                events.value = events.value.filter((e) => e.id !== id);
                break;

            case 'Product':
                products.value = products.value.filter((p) => p.id !== id);
                break;

            case 'Sell':
                sales.value = sales.value.filter((s) => s.id !== id);
                break;

            default:
                break;
        }

        saveData();
    };

    const saveData = async () => {
        try {
            // Costruisci l'oggetto completo correttamente
            const newStore = {
                events: events.value,
                products: products.value,
                sales: sales.value,
            };

            // Costruisci il payload con il token e l'oggetto dati
            const payload = {
                token: API_TOKEN,
                data: newStore,
            };

            const response = await axios.post(
                "https://iot.solariumsmart.it/cloudsolarium/public/customRoute/shop/save",
                payload
            );

            if (response.data && response.data.success) {
                console.log("Dati salvati correttamente sul backend");

            } else {
                console.error("Errore nel salvataggio:", response.data);
            }
            saveProcess.value = false
        } catch (error) {
            console.error("Errore durante il salvataggio dei dati sul backend:", error);
        }
    };

    const loadData = async () => {
        console.log("Inizio Loading")
        if (loaded.value) return;
        console.log("Primo Check")
        try {
            console.log("Dentro a Try")
            const res = await axios.post(
                "https://iot.solariumsmart.it/cloudsolarium/public/customRoute/shop/get",
                {
                    token: API_TOKEN,
                }
            );
            if (res.data && typeof res.data === "object") {
                console.log("Dati Caricati")
                events.value = res.data.events || [];
                products.value = res.data.products || [];
                sales.value = res.data.sales || [];
                loaded.value = true;
            } else {
                console.warn("Formato dati non valido:", res.data);
            }
        } catch (error) {
            console.error("Errore nel caricamento dati da backend:", error);
        }
    };

    onMounted(loadData);

    return {
        duplicateFound,
        removeInstance,
        setDuplication,
        events,
        addInstance,
        saveProcess,
        products,
        sales,
        currentSelection,
        transitionName,
        setSelection,
        editInstance,
        loadData,
        saveData,
    };
})