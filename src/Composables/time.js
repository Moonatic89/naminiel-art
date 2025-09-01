export const formatData = (date, format, debug = false) => {
    if (!date) {
        console.warn("La data fornita è null o undefined");
        return 'NOT_A_DATE'; // Ritorna una stringa vuota o gestisci come preferisci
    }

    // Separazione di data e ora, se presenti
    const [datePart, timePart] = date.split(' ');
    const [year, month, day] = datePart.includes('/') ? datePart.split('/') : datePart.split('-');

    // Gestione del formato
    let formattedDate;
    switch (format) {
        case 'd/m/Y':
        case 'd/m/y':
            formattedDate = `${day}/${month}/${year}`;
            break;
        case 'm/d/Y':
        case 'm/d/y':
            formattedDate = `${month}/${day}/${year}`;
            break;
        case 'Y/m/d':
        case 'y/m/d':
            formattedDate = `${year}/${month}/${day}`;
            break;
        default:
            formattedDate = `${day}/${month}/${year}`;
    }

    // Aggiungi l'ora, se presente
    if (timePart) {
        formattedDate += ` ${timePart}`;
    }

    // Debug opzionale
    if (debug) {
        console.log(`Input date: ${date}, Format: ${format}, Formatted: ${formattedDate}`);
    }

    return formattedDate;
};