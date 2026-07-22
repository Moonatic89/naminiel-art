import polaroids from './polaroids/en';
import lucifer from './lucifer/en';
import roleplay from './roleplay/en';

export default {
    localeName: 'English',
    nav: {
        home: 'Home',
        blog: 'Blog',
        original: 'Originals',
        fanArt: 'Fan art',
        commissions: 'Commissions',
        about: 'About',
        login: 'Login',
        logout: 'Logout',
        languageLabel: 'Language',
    },
    home: {
        title: 'Naminiel',
        hero: {
            brand: 'Naminiel Art',
            showFanArt: 'Show fan art',
            showOriginalArt: 'Show original art',
            original: 'Original',
            fanArt: 'Fan Art',
        },
        sections: {
            solcatempoDawn: {
                kicker: '01 / Featured project',
                body: 'Solcatempo is an illustrated world of wind, blades, and memory. Step into a fantasy saga where every mark opens a threshold.',
            },
            vestara: {
                kicker: '02 / Solcatempo',
                subtitle: 'The Heartbeat of Vestara',
            },
            benandanti: {
                kicker: '03 / Karmic guardians',
                title: 'Benandanti',
                body: 'Mystical protectors created to walk beside fear, desire, and transformation.',
                trackLabel: 'Choose a Benandante',
                items: [
                    {
                        name: 'Kumirai',
                        chakra: 'Third eye',
                        image: '/media/benandanti/kumirai.webp',
                        full: 'Kumirai watches over dreams and helps you see past illusions. Silent and steady, he brings calm when everything starts to blur.',
                        short: 'Clear vision and protection from illusions.',
                    },
                    {
                        name: 'Selvanello',
                        chakra: 'Roots',
                        image: '/media/benandanti/selvanello.webp',
                        full: 'Selvanello is play, earth, and instinct. He runs, shifts, and defends what grows, reminding you that lightness can be a kind of strength.',
                        short: 'Roots, play, and protection.',
                    },
                    {
                        name: 'Druden',
                        chakra: 'Voice',
                        image: '/media/benandanti/druden.webp',
                        full: 'Druden guards the right words. She helps reveal lies, speak truth, and find the place that finally feels like home.',
                        short: 'Truth, dialogue, and return.',
                    },
                    {
                        name: 'Lumira',
                        chakra: 'Heart',
                        image: '/media/benandanti/lumira.webp',
                        full: 'Lumira absorbs fear and turns it into light. Small and brave, he brings comfort when the dark feels too close.',
                        short: 'Luminous comfort against fear.',
                    },
                    {
                        name: 'White Lady',
                        chakra: 'Crown',
                        image: '/media/benandanti/dama-bianca.webp',
                        full: 'The White Lady sings for those who seek what lives beyond the visible. Her melancholy does not dim the world: it opens wonder.',
                        short: 'Cosmic song and vision.',
                    },
                    {
                        name: 'Alopisco',
                        chakra: 'Solar plexus',
                        image: '/media/benandanti/alopisco.webp',
                        full: 'Alopisco carries warmth, will, and presence. Like an ancient sun, he guides anyone who needs energy and direction again.',
                        short: 'Life force and determination.',
                    },
                    {
                        name: 'Lullaknight',
                        chakra: 'Muse',
                        image: '/media/benandanti/lullaknight.webp',
                        full: 'Lullaknight protects those who create. Her melody comforts, but it also asks for respect: for art, promises, and the courage to be seen.',
                        short: 'Muse, art, and promise.',
                    },
                ],
            },
            polaroids,
            magicalGirls: {
                kicker: '05 / Majokko collection',
                title: 'Magikal Girls',
                items: [
                    ['Ribbon moon', 'Soft transformations, luminous poses, and characters with magic that still feels personal.'],
                    ['Sealed book', 'Living pages, gentle spells, and a hint of chaos for anyone who loves narrative magic.'],
                    ['Meteor wand', 'Pop energy, sparks, and silhouettes designed to read at first glance.'],
                    ['Violet mirror', 'Elegance, secrets, and powers that shift with the character.'],
                ],
            },
            roleplay,
            lucifer,
            pamsticceria: {
                kicker: '08 / Beastly pastry shop',
                title: 'Pamsticceria',
                items: [
                    ['Lumacaron', 'Slow on the outside, very quick to be loved.'],
                    ['Milk Snake', 'Milk, vanilla, and stripes from an impossible dessert.'],
                    ['Tortartaruga', 'A glazed shell with a fruit-filled heart and a calm pace.'],
                    ['Bignorso', 'Soft, huge, and ready to get covered in cream.'],
                    ['Cignocannolo', 'Elegant as a pastry window just after opening.'],
                    ['Pavoncake', 'Bright colors, sugar feathers, and full celebration.'],
                ],
            },
            characterLab: {
                kicker: '09 / Character Lab',
                title: 'Living commissions',
                body: 'Design, poses, and reference cards for original characters, avatars, mascots, and ideas that deserve a clear identity.',
                items: [
                    ['Pose sheet', 'Silhouette, outfit, and stage presence studies.'],
                    ['Color key', 'Palettes, contrast, and small details that reveal character.'],
                    ['Expression pass', 'Readable expressions that make the character feel alive.'],
                    ['Final card', 'A clean presentation, ready to share or use as reference.'],
                ],
            },
            oc: {
                kicker: '10 / Original Characters',
                title: 'OC',
                body: 'Original characters with roots, contradictions, and personal worlds. A gallery for anyone looking for new identities, not just pretty images.',
                items: [
                    ['Archive', 'Stories, symbols, and details that make a character memorable.'],
                    ['Silhouette', 'Figures you can recognize before the color arrives.'],
                    ['Relationships', 'Bonds, tensions, and small personal worlds.'],
                    ['Portrait', 'A steady pose, a look that stays.'],
                ],
            },
            fanart: {
                kicker: '11 / Fan Art',
                title: 'Fanart',
                body: 'Tributes, icons, and recognizable scenes reimagined with a personal signature, for people who love a character and want to see them breathe differently.',
                items: [
                    ['Tribute', 'Illustrations faithful to the source’s spirit, shaped by a recognizable hand.'],
                    ['Icon', 'Beloved characters reworked with an illustrative eye.'],
                    ['Scene', 'A recognizable moment composed like a print.'],
                    ['Energy', 'The right gesture, just before the image runs away.'],
                ],
            },
        },
    },
};
