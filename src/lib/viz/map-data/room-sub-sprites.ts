import { roomGroupName } from './room-groups';

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
                sceneName: 'group_bretta',
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
    RestingGrounds_05: {
        parentSpriteWithoutSubSprites: {
            normal: 'edited/RestingGrounds_05',
            rough: null,
            conditional: null,
        },
        childSprites: [
            {
                normal: {
                    name: 'edited/RestingGrounds_05_Entrance',
                    size: { x: 36, y: 29 },
                    offsetTop: { x: 0, y: 7 },
                },
                rough: null, // if needed in the future also create rough version
                conditional: null,
                sceneName: 'RestingGrounds_07',
            },
        ],
    },
    Ruins1_04: {
        parentSpriteWithoutSubSprites: {
            normal: 'edited/Ruins1_04',
            rough: null,
            conditional: null,
        },
        childSprites: [
            {
                normal: {
                    name: 'edited/Ruins1_04_Entrance',
                    size: { x: 42, y: 61 },
                    offsetTop: { x: 24, y: 9 },
                },
                rough: null,
                conditional: null,
                sceneName: 'Room_nailsmith',
            },
        ],
    },
    Crossroads_02: {
        parentSpriteWithoutSubSprites: {
            normal: 'edited/Crossroads_02',
            rough: null,
            conditional: null,
        },
        childSprites: [
            {
                normal: {
                    name: 'edited/Crossroads_02_Entrance',
                    size: { x: 64, y: 39 },
                    offsetTop: { x: 38, y: 9 },
                },
                rough: null,
                conditional: null,
                sceneName: roomGroupName('group_blackEggTemple'),
            },
        ],
    },
    Fungus3_47: {
        parentSpriteWithoutSubSprites: {
            normal: 'edited/Fungus3_47',
            rough: null,
            conditional: null,
        },
        childSprites: [
            {
                normal: {
                    name: 'edited/Fungus3_47_Entrance',
                    size: { x: 69, y: 42 },
                    offsetTop: { x: 42, y: 9 },
                },
                rough: null,
                conditional: null,
                sceneName: roomGroupName('group_Fungus3_archive'),
            },
        ],
    },
    Fungus1_18: {
        parentSpriteWithoutSubSprites: {
            normal: 'edited/Fungus1_18',
            rough: null,
            conditional: null,
        },
        childSprites: [
            {
                normal: {
                    name: 'edited/Fungus1_18_Entrance',
                    size: { x: 42, y: 36 },
                    offsetTop: { x: 154, y: 0 },
                },
                rough: null,
                conditional: null,
                sceneName: roomGroupName('group_stone_sanctuary'),
            },
        ],
    },
    Fungus1_15: {
        parentSpriteWithoutSubSprites: {
            normal: 'edited/Fungus1_15',
            rough: null,
            conditional: null,
        },
        childSprites: [
            {
                normal: {
                    name: 'edited/Fungus1_15_Entrance',
                    size: { x: 75, y: 38 },
                    offsetTop: { x: 14, y: 15 },
                },
                rough: null,
                conditional: null,
                sceneName: 'Room_nailmaster_02',
            },
        ],
    },
    Cliffs_02: {
        parentSpriteWithoutSubSprites: {
            normal: 'edited/Cliffs_02',
            rough: null,
            conditional: null,
        },
        childSprites: [
            {
                normal: {
                    name: 'edited/Cliffs_02_Nailmaster',
                    size: { x: 51, y: 35 },
                    offsetTop: { x: 188, y: 107 },
                },
                rough: null,
                conditional: null,
                sceneName: 'Room_nailmaster',
            },
        ],
    },
    Deepnest_East_06: {
        parentSpriteWithoutSubSprites: {
            normal: 'edited/Deepnest_East_06',
            rough: null,
            conditional: null,
        },
        childSprites: [
            {
                normal: {
                    name: 'edited/Deepnest_East_06_Nailmaster',
                    size: { x: 62, y: 41 },
                    offsetTop: { x: 478, y: 17 },
                },
                rough: null,
                conditional: null,
                sceneName: 'Room_nailmaster_03',
            },
        ],
    },
    Abyss_09: {
        parentSpriteWithoutSubSprites: {
            normal: 'edited/Abyss_09',
            rough: null,
            conditional: null,
        },
        childSprites: [
            {
                normal: {
                    name: 'edited/Abyss_09_Lighthouse',
                    size: { x: 75, y: 42 },
                    offsetTop: { x: 113, y: 23 },
                },
                rough: null,
                conditional: null,
                sceneName: 'Abyss_Lighthouse_room',
            },
        ],
    },
    Deepnest_10: {
        parentSpriteWithoutSubSprites: {
            normal: 'edited/Deepnest_10',
            rough: null,
            conditional: null,
        },
        childSprites: [
            {
                normal: {
                    name: 'edited/Deepnest_10_Herrah',
                    size: { x: 58, y: 66 },
                    offsetTop: { x: 45, y: 41 },
                },
                rough: null,
                conditional: null,
                sceneName: 'group_beasts_den',
            },
            {
                normal: {
                    name: 'edited/Deepnest_10_Tiny_Room',
                    size: { x: 49, y: 59 },
                    offsetTop: { x: 27, y: 89 },
                },
                rough: null,
                conditional: null,
                sceneName: 'Room_spider_small',
            },
        ],
    },
    RestingGrounds_12: {
        parentSpriteWithoutSubSprites: {
            normal: 'edited/RestingGrounds_12',
            rough: null,
            conditional: null,
        },
        childSprites: [
            {
                normal: {
                    name: 'edited/RestingGrounds_12_Grey_Mourner',
                    size: { x: 47, y: 40 },
                    offsetTop: { x: 89, y: 15 },
                },
                rough: null,
                conditional: null,
                sceneName: 'Room_Mansion',
            },
        ],
    },
    Mines_28_b: {
        parentSpriteWithoutSubSprites: {
            normal: 'edited/Mines_28_b',
            rough: null,
            conditional: null,
        },
        childSprites: [
            {
                normal: {
                    name: 'edited/Mines_28_b_Mound',
                    size: { x: 63, y: 34 },
                    offsetTop: { x: 46, y: 13 },
                },
                rough: null,
                conditional: null,
                sceneName: 'Mines_35',
            },
        ],
    },
};

type SubSprites = typeof subSprites;
type SubSprite = SubSprites[keyof SubSprites];

export function getSubSprites(roomName: string) {
    return (subSprites as Record<string, SubSprite>)[roomName];
}
