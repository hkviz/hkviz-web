// use for aggregation and for display:
export const roomGroups = {
    groupBretta: ['Room_Bretta_Basement', 'Room_Bretta'], // Dream_Mighty_Zote
};

export const subSprites = {
    Town: {
        parentSpriteWithoutSubSprites: {
            normal: 'edited/Town',
            rough: null,
            conditional: 'edited/Town_b',
        },
        childSprites: [
            {
                normal: {
                    name: 'edited/Town_MapShop',
                    size: { x: 40, y: 35 },
                    offsetTop: { x: 211, y: 86 },
                },
                rough: null,
                conditional: {
                    name: 'edited/Town_b_MapShop',
                    size: { x: 36, y: 35 },
                    offsetTop: { x: 214, y: 118 },
                },
                sceneName: 'Room_mapper',
            },
            {
                normal: {
                    name: 'edited/Town_Sly',
                    size: { x: 37, y: 28 },
                    offsetTop: { x: 163, y: 94 },
                },
                rough: null,
                conditional: {
                    name: 'edited/Town_b_Sly',
                    size: { x: 34, y: 26 },
                    offsetTop: { x: 164, y: 127 },
                },
                sceneName: 'Room_shop',
            },
            {
                normal: {
                    name: 'edited/Town_Stag',
                    size: { x: 29, y: 29 },
                    offsetTop: { x: 195, y: 93 },
                },
                rough: null,
                conditional: {
                    name: 'edited/Town_b_Stag',
                    size: { x: 30, y: 28 },
                    offsetTop: { x: 192, y: 125 },
                },
                sceneName: 'Room_Town_Stag_Station',
            },
            {
                normal: {
                    name: 'edited/Town_Bretta',
                    size: { x: 19, y: 22 },
                    offsetTop: { x: 247, y: 99 },
                },
                rough: null,
                conditional: {
                    name: 'edited/Town_b_Bretta',
                    size: { x: 20, y: 22 },
                    offsetTop: { x: 246, y: 131 },
                },
                sceneName: 'Room_Bretta',
            },
            {
                normal: {
                    name: 'edited/Town_Jiji',
                    size: { x: 30, y: 38 },
                    offsetTop: { x: 378, y: 90 },
                },
                rough: null,
                conditional: {
                    name: 'edited/Town_b_Jiji',
                    size: { x: 28, y: 33 },
                    offsetTop: { x: 380, y: 126 },
                },
                sceneName: 'Room_Ouiji', // group with steel soul jinn needed?
            },
        ],
    },
    Crossroads_06: {
        parentSpriteWithoutSubSprites: {
            normal: 'edited/Crossroads_06',
            rough: null,
            conditional: null,
        },
        childSprites: [
            {
                normal: {
                    name: 'edited/Crossroads_06_Entrance',
                    size: { x: 50, y: 41 },
                    offsetTop: { x: 16, y: 13 },
                },
                rough: null,
                conditional: null,
                sceneName: 'Crossroads_ShamanTemple',
            },
        ],
    },
    Fungus3_44: {
        parentSpriteWithoutSubSprites: {
            normal: 'edited/Fungus3_44',
            rough: null,
            conditional: null,
        },
        childSprites: [
            {
                normal: {
                    name: 'edited/Fungus3_44_Entrance',
                    size: { x: 53, y: 33 },
                    offsetTop: { x: 9, y: 3 },
                },
                rough: null,
                conditional: null,
                sceneName: 'Room_Fungus_Shaman',
            },
        ],
    },
    Crossroads_04: {
        parentSpriteWithoutSubSprites: {
            normal: 'edited/Crossroads_04',
            rough: null,
            conditional: null,
        },
        childSprites: [
            {
                normal: {
                    name: 'edited/Crossroads_04_Entrance',
                    size: { x: 38, y: 32 },
                    offsetTop: { x: 201, y: 21 },
                },
                rough: null,
                conditional: null,
                sceneName: 'Room_Charm_Shop',
            },
        ],
    },
    Crossroads_04_b: {
        parentSpriteWithoutSubSprites: {
            normal: 'edited/Crossroads_04_b',
            rough: null,
            conditional: null,
        },
        childSprites: [
            {
                normal: {
                    name: 'edited/Crossroads_04_b_Sly',
                    size: { x: 31, y: 26 },
                    offsetTop: { x: 61, y: 21 },
                },
                rough: null,
                conditional: null,
                sceneName: 'Room_ruinhouse',
            },
            {
                normal: {
                    name: 'edited/Crossroads_04_b_MenderBug',
                    size: { x: 35, y: 26 },
                    offsetTop: { x: 8, y: 21 },
                },
                rough: null,
                conditional: null,
                sceneName: 'Room_Mender_House',
            },
        ],
    },
};

type SubSprites = typeof subSprites;
type SubSprite = SubSprites[keyof SubSprites];

export function getSubSprites(roomName: string) {
    return (subSprites as Record<string, SubSprite>)[roomName];
}
