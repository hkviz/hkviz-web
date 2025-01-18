// Generated by find-conditionals.ts
// this file is not licensed at the same license as most of the files in this repository
// it has been extracted from Hollow Knight;
// and is therefore mostly intellectual property of TeamCherry from https://www.teamcherry.com.au/
// some room have been extracted from the AdditionalMaps mod https://github.com/SFGrenade/AdditionalMaps

import { type RoomDataConditional } from './map-rooms-conditionals.types';

export const roomDataConditionals: Record<string, RoomDataConditional> = {
    Deepnest_East_01: {
        conditionalOn: ['Hive_03_c'],
        name: 'Deepnest_East_01_b',
        size: { x: 107, y: 169 },
        padding: { x: 0, y: 0, z: 0, w: 0 },
    },
    Deepnest_01: {
        conditionalOn: ['Deepnest_01b'],
        name: 'Deepnest_01_b',
        size: { x: 106, y: 75 },
        padding: { x: 0, y: 0, z: 0, w: 0 },
    },
    Deepnest_03: {
        conditionalOn: ['Deepnest_31'],
        name: 'Deepnest_03_b',
        size: { x: 105, y: 211 },
        padding: { x: 0, y: 0, z: 0, w: 0 },
    },
    Town: {
        conditionalOn: ['Mines_10'],
        name: 'Town_b',
        size: { x: 408, y: 214 },
        padding: { x: 0, y: 38.0761223, z: 0, w: 6.076126 },
    },
    // not generated
    Town_grimm: {
        conditionalOn: ['Grimm_Main_Tent', 'Grimm_Nightmare', 'Grimm_Divine'],
        name: 'edited/Town_grimm',
        size: { x: 102, y: 89 },
        padding: { x: 0, y: 0, z: 0, w: 0 },
    },
};

export function roomDataConditionalByGameObjectName(gameObjectName: string): RoomDataConditional | null {
     
    return roomDataConditionals[gameObjectName] ?? null;
}
