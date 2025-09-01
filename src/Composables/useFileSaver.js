export function useFileSaver() {
    async function saveToFile(fileHandle, data) {
        try {
            if (!fileHandle) {
                console.error("Errore: Nessun file selezionato per il salvataggio.");
                return;
            }

            if (fileHandle.createWritable) {
                const writable = await fileHandle.createWritable();
                await writable.write(JSON.stringify(data, null, 2));
                await writable.close();
            } else {
                console.error("Il file selezionato non supporta la scrittura diretta.");
            }
        } catch (error) {
            console.error("Errore nel salvataggio del file:", error);
        }
    }

    return { saveToFile };
}
