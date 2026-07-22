export const homeImagePool = {
    hero: {
        original: [
            {
                src: 'https://hqbmfndntgzbgprrbrhm.supabase.co/storage/v1/object/public/nav/nav_venerdi.webp',
                alt: 'Original art preview',
            },
        ],
        fanArt: [
            {
                src: 'https://hqbmfndntgzbgprrbrhm.supabase.co/storage/v1/object/public/nav/nav_goku.webp',
                alt: 'Fan art preview',
            },
        ],
    },
    solcatempo: {
        pool: [],
        selected: [],
    },
    benandanti: {
        pool: [
            { src: '/media/benandanti/kumirai.webp', alt: 'Kumirai' },
            { src: '/media/benandanti/selvanello.webp', alt: 'Selvanello' },
            { src: '/media/benandanti/druden.webp', alt: 'Druden' },
            { src: '/media/benandanti/lumira.webp', alt: 'Lumira' },
            { src: '/media/benandanti/dama-bianca.webp', alt: 'Dama Bianca' },
            { src: '/media/benandanti/alopisco.webp', alt: 'Alopisco' },
            { src: '/media/benandanti/lullaknight.webp', alt: 'Lullaknight' },
        ],
        selected: [],
    },
    polaroids: {
        pool: [
            { src: '/media/home/polaroids/polaroid-01.webp', alt: 'Polaroid illustrata di viaggio 1', fit: 'cover', position: 'center' },
            { src: '/media/home/polaroids/polaroid-02.webp', alt: 'Polaroid illustrata di viaggio 2', fit: 'cover', position: 'center' },
            { src: '/media/home/polaroids/polaroid-03.webp', alt: 'Polaroid illustrata di viaggio 3', fit: 'cover', position: 'center' },
            { src: '/media/home/polaroids/polaroid-04.webp', alt: 'Polaroid illustrata di viaggio 4', fit: 'cover', position: 'center' },
            { src: '/media/home/polaroids/polaroid-05.webp', alt: 'Polaroid illustrata di viaggio 5', fit: 'cover', position: 'center' },
            { src: '/media/home/polaroids/polaroid-06.webp', alt: 'Polaroid illustrata di viaggio 6', fit: 'cover', position: 'center' },
        ],
        selected: [
            { src: '/media/home/polaroids/polaroid-01.webp', alt: 'Polaroid illustrata di viaggio 1', fit: 'cover', position: 'center' },
            { src: '/media/home/polaroids/polaroid-02.webp', alt: 'Polaroid illustrata di viaggio 2', fit: 'cover', position: 'center' },
            { src: '/media/home/polaroids/polaroid-03.webp', alt: 'Polaroid illustrata di viaggio 3', fit: 'cover', position: 'center' },
            { src: '/media/home/polaroids/polaroid-04.webp', alt: 'Polaroid illustrata di viaggio 4', fit: 'cover', position: 'center' },
        ],
    },
    magicalGirls: {
        pool: [],
        selected: [],
    },
    roleplay: {
        pool: [
            { src: '/media/home/character-lab/C&D-01.webp', alt: 'Customs & Dragons - personaggio arcano in movimento', fit: 'contain', position: 'center' },
            { src: '/media/home/character-lab/C&D-02.webp', alt: 'Customs & Dragons - scena narrativa con rune luminose', fit: 'contain', position: 'center' },
            { src: '/media/home/character-lab/C&D-03.webp', alt: 'Customs & Dragons - coppia fantasy tra ricordi e fuochi', fit: 'contain', position: 'center' },
            { src: '/media/home/character-lab/C&D-04.webp', alt: 'Customs & Dragons - personaggio mascherato in armatura rossa', fit: 'contain', position: 'center' },
        ],
        selected: [
            { src: '/media/home/character-lab/C&D-01.webp', alt: 'Customs & Dragons - personaggio arcano in movimento', fit: 'contain', position: 'center' },
            { src: '/media/home/character-lab/C&D-02.webp', alt: 'Customs & Dragons - scena narrativa con rune luminose', fit: 'contain', position: 'center' },
            { src: '/media/home/character-lab/C&D-03.webp', alt: 'Customs & Dragons - coppia fantasy tra ricordi e fuochi', fit: 'contain', position: 'center' },
            { src: '/media/home/character-lab/C&D-04.webp', alt: 'Customs & Dragons - personaggio mascherato in armatura rossa', fit: 'contain', position: 'center' },
        ],
    },
    lucifer: {
        pool: [
            { src: '/media/home/lucifer/pl-01.webp', alt: 'Project Lucifer - monumento caduto tra neon e ali nere', fit: 'contain', position: 'center' },
        ],
        selected: [
            { src: '/media/home/lucifer/pl-01.webp', alt: 'Project Lucifer - monumento caduto tra neon e ali nere', fit: 'contain', position: 'center' },
        ],
    },
    pamsticceria: {
        pool: [],
        selected: [],
    },
    characterLab: {
        pool: [],
        selected: [],
    },
    oc: {
        pool: [],
        selected: [],
    },
    fanart: {
        pool: [],
        selected: [],
    },
};

export function selectedHomeImage(section, index = 0) {
    return homeImagePool[section]?.selected?.[index] ?? null;
}
