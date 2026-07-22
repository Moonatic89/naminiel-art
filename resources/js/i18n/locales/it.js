import polaroids from './polaroids/it';
import lucifer from './lucifer/it';
import roleplay from './roleplay/it';

export default {
    localeName: 'Italiano',
    nav: {
        home: 'Home',
        blog: 'Blog',
        original: 'Originali',
        fanArt: 'Fan art',
        commissions: 'Commissioni',
        about: 'About',
        login: 'Login',
        logout: 'Esci',
        languageLabel: 'Lingua',
    },
    home: {
        title: 'Naminiel',
        hero: {
            brand: 'Naminiel Art',
            showFanArt: 'Mostra fan art',
            showOriginalArt: 'Mostra arte originale',
            original: 'Original',
            fanArt: 'Fan Art',
        },
        sections: {
            solcatempoDawn: {
                kicker: '01 / Progetto in evidenza',
                body: 'Solcatempo è un universo illustrato fatto di vento, lama e memoria. Un invito a entrare in una saga fantasy dove ogni segno apre una soglia.',
            },
            vestara: {
                kicker: '02 / Solcatempo',
                subtitle: 'Il Battito di Vestara',
            },
            benandanti: {
                kicker: '03 / Guardiani karmici',
                title: 'Benandanti',
                body: 'Creature mistiche e protettive, nate per accompagnare chi attraversa paure, desideri e trasformazioni.',
                trackLabel: 'Scegli un Benandante',
                items: [
                    {
                        name: 'Kumirai',
                        chakra: 'Terzo occhio',
                        image: '/media/benandanti/kumirai.webp',
                        full: 'Kumirai veglia sui sogni e aiuta a vedere oltre le illusioni. Silenzioso e imperturbabile, porta calma quando tutto sembra confondersi.',
                        short: 'Visione lucida e protezione dalle illusioni.',
                    },
                    {
                        name: 'Selvanello',
                        chakra: 'Radici',
                        image: '/media/benandanti/selvanello.webp',
                        full: 'Selvanello è gioco, terra e istinto. Corre, cambia forma e difende ciò che cresce, ricordando che anche la leggerezza può essere una forza.',
                        short: 'Radici, gioco e protezione.',
                    },
                    {
                        name: 'Druden',
                        chakra: 'Voce',
                        image: '/media/benandanti/druden.webp',
                        full: 'La Druden custodisce la parola giusta. Aiuta a riconoscere le bugie, a dire la verità e a tornare dove ci si sente finalmente a casa.',
                        short: 'Verità, dialogo e ritorno.',
                    },
                    {
                        name: 'Lumira',
                        chakra: 'Cuore',
                        image: '/media/benandanti/lumira.webp',
                        full: 'Lumira assorbe la paura e la trasforma in luce. Piccolo e coraggioso, porta conforto quando il buio sembra troppo vicino.',
                        short: 'Conforto luminoso contro la paura.',
                    },
                    {
                        name: 'Dama Bianca',
                        chakra: 'Corona',
                        image: '/media/benandanti/dama-bianca.webp',
                        full: 'La Dama Bianca canta per chi cerca qualcosa oltre il visibile. La sua malinconia non spegne: apre ascolto, visione e meraviglia.',
                        short: 'Canto cosmico e visione.',
                    },
                    {
                        name: 'Alopisco',
                        chakra: 'Plesso solare',
                        image: '/media/benandanti/alopisco.webp',
                        full: 'Alopisco porta calore, volontà e presenza. Come un sole antico, guida chi ha bisogno di ritrovare energia e direzione.',
                        short: 'Forza vitale e determinazione.',
                    },
                    {
                        name: 'Lullaknight',
                        chakra: 'Musa',
                        image: '/media/benandanti/lullaknight.webp',
                        full: 'Lullaknight protegge chi crea. La sua melodia consola, ma chiede rispetto per l’arte, per le promesse e per il coraggio di mostrarsi.',
                        short: 'Musa, arte e promessa.',
                    },
                ],
            },
            polaroids,
            magicalGirls: {
                kicker: '05 / Majokko collection',
                title: 'Magikal Girls',
                items: [
                    ['Luna a nastro', 'Trasformazioni morbide, pose luminose e personaggi che portano magia senza perdere personalità.'],
                    ['Libro sigillato', 'Pagine vive, formule gentili e un tocco di caos per chi ama il lato narrativo della magia.'],
                    ['Scettro meteora', 'Energia pop, scintille e silhouette pensate per restare riconoscibili al primo sguardo.'],
                    ['Specchio viola', 'Eleganza, segreti e poteri che cambiano forma insieme al personaggio.'],
                ],
            },
            roleplay,
            lucifer,
            pamsticceria: {
                kicker: '08 / Pasticceria bestiale',
                title: 'Pamsticceria',
                items: [
                    ['Lumacaron', 'Un dolce lento fuori e velocissimo nel farsi amare.'],
                    ['Milk Snake', 'Latte, vaniglia e strisce da dessert impossibile.'],
                    ['Tortartaruga', 'Una cupola glassata con cuore di frutta e passo tranquillo.'],
                    ['Bignorso', 'Morbido, gigante e pronto a sporcarsi di panna.'],
                    ['Cignocannolo', 'Elegante come una vetrina appena aperta.'],
                    ['Pavoncake', 'Colori alti, piume di zucchero e festa totale.'],
                ],
            },
            characterLab: {
                kicker: '09 / Character Lab',
                title: 'Commissioni vive',
                body: 'Design, pose e schede per dare forma a personaggi originali, avatar, mascotte e idee che meritano un’identità chiara.',
                items: [
                    ['Pose sheet', 'Studio della silhouette, dell’outfit e della presenza scenica.'],
                    ['Color key', 'Palette, contrasti e piccoli dettagli che raccontano il carattere.'],
                    ['Expression pass', 'Espressioni leggibili per rendere vivo il personaggio.'],
                    ['Final card', 'Una presentazione pulita, pronta da mostrare o usare come riferimento.'],
                ],
            },
            oc: {
                kicker: '10 / Original Characters',
                title: 'OC',
                body: 'Personaggi originali con radici, contraddizioni e mondi personali. Una galleria per chi cerca identità nuove, non solo belle immagini.',
                items: [
                    ['Archivio', 'Storie, simboli e dettagli che rendono un personaggio memorabile.'],
                    ['Silhouette', 'Figure riconoscibili ancora prima del colore.'],
                    ['Relazioni', 'Legami, tensioni e piccoli mondi personali.'],
                    ['Ritratto', 'Una posa ferma, uno sguardo che resta.'],
                ],
            },
            fanart: {
                kicker: '11 / Fan Art',
                title: 'Fanart',
                body: 'Omaggi, icone e scene riconoscibili reinterpretate con una firma personale, per chi ama un personaggio e vuole vederlo respirare in modo nuovo.',
                items: [
                    ['Omaggio', 'Illustrazioni fedeli allo spirito della fonte, ma con una mano riconoscibile.'],
                    ['Icona', 'Personaggi noti ripensati con taglio illustrativo.'],
                    ['Scena', 'Un momento riconoscibile composto come una stampa.'],
                    ['Energia', 'Il gesto giusto, prima che l’immagine scappi.'],
                ],
            },
        },
    },
};
