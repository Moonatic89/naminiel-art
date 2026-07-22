# Home Image Pool

Organizza qui le immagini candidate per la home.

## Cartelle

- `hero/`: immagini principali o alternative per la prima schermata.
- `solcatempo/`: logo, ambientazioni e asset del progetto Solcatempo.
- `benandanti/`: immagini dei guardiani e varianti.
- `polaroids/`: immagini per la sezione Polaroid Pokemon.
- `magical-girls/`: immagini per la sezione Magikal Girls.
- `roleplay/`: personaggi, props e scene da gioco di ruolo.
- `lucifer/`: immagini per Project Lucifer.
- `pamsticceria/`: dolci, creature e card Pamsticceria.
- `character-lab/`: pose, sheet, expression e final card.
- `oc/`: original characters.
- `fanart/`: fan art e reinterpretazioni.

## Convenzione consigliata

Usa nomi leggibili e stabili:

```text
nome-progetto-01.webp
nome-progetto-02.webp
nome-progetto-detail.webp
```

Per usarle nella home, aggiungi il path in:

```text
resources/js/home/imagePool.js
```

Esempio:

```js
selected: [
    { src: '/media/home/polaroids/rotte-leggere.webp', alt: 'Polaroid Pokemon con compagni di viaggio' },
]
```
