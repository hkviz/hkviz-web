import { type ZoneNameFormatted } from './room-name-formatting';

export function zoomZone(zoneNameFormatted: ZoneNameFormatted) {
    switch (zoneNameFormatted) {
        case 'Ancient Basin':
            return 'The Abyss' satisfies ZoneNameFormatted;
        case 'Dirtmouth':
            return 'Forgotten Crossroads' satisfies ZoneNameFormatted;
        case 'Hive':
            return "Kingdom's Edge" satisfies ZoneNameFormatted;
        case 'Royal Waterways':
            return 'City of Tears' satisfies ZoneNameFormatted;
        default:
            return zoneNameFormatted;
    }
}

export type ZoomZone = ReturnType<typeof zoomZone>;

const extraZoomZones: Record<string, ZoomZone[]> = {
    Crossroads_11_alt: ['Greenpath'],
    Fungus2_01: ['Fog Canyon'], // Queens Station
    Fungus2_02: ['Fog Canyon'], // Queens Station
    Fungus2_34: ['Fog Canyon'], // Queens Station
    Abyss_01: ['City of Tears'], // Long room between city and abyss located in royal waterways
    Fungus2_25: ['Fungal Wastes'], // Mantis Village entrance to deep nest
    Mines_01: ['Forgotten Crossroads'], // Crystal Peak entrance from dirtmouth
    Mines_10: ['Forgotten Crossroads'], // Crystal Peak entrance from dirtmouth
    Mines_16: ['Forgotten Crossroads'], // Crystal Peak entrance from dirtmouth
    Fungus1_11: ['Fog Canyon'], // Greenpath room path to bench
    Fungus1_37: ['Fog Canyon'], // Greenpath room path to bench
    Fungus2_23: [zoomZone('Royal Waterways')], // Manthis path to royal waterways
    Ruins2_04: [zoomZone('Royal Waterways')], // Path from Emilitia
    Abyss_02: [zoomZone('Royal Waterways'), zoomZone('City of Tears')],
    Deepnest_East_09: [zoomZone('City of Tears')], // elevator exit to colosseum
    Ruins2_07: [zoomZone("Kingdom's Edge")], // kings station to edge
    Ruins2_11_b: [zoomZone("Kingdom's Edge")], // kings station to edge
    Ruins2_11: [zoomZone("Kingdom's Edge")], // kings station to edge
    Ruins2_06: [zoomZone("Kingdom's Edge")], // kings station to edge
    Ruins2_08: [zoomZone("Kingdom's Edge")], // kings station to edge
    Fungus3_26: [zoomZone('Forgotten Crossroads')], // flower quest common entrance to fog canyon from crossroads
    Deepnest_01: [zoomZone('Deepnest')], // room in fungus
    Fungus1_28: [zoomZone('Greenpath')], // hive entrance from greenpath
    Waterways_14: [zoomZone("Kingdom's Edge")], // path at top of waterways to edge
    Fungus3_34: [zoomZone('Fog Canyon')], // near up spell collection
    Fungus3_44: [zoomZone("Queen's Gardens")],

    Crossroads_18: [zoomZone('Fungal Wastes')],
    Crossroads_52: [zoomZone('Fungal Wastes')],

    Fungus3_22: [zoomZone('Greenpath')],
    Fungus1_13: [zoomZone("Queen's Gardens")],
};

export const gameObjectNamesIgnoredInZoomZone = new Set([
    'Abyss_03_b', // tram passage, visual just on map, but can not be entered. Therefore no need to zoom to it.
]);

export function getZoomZones(sceneName: string, zoneNameFormatted: ZoneNameFormatted): readonly ZoomZone[] {
    const mainZoomZone = zoomZone(zoneNameFormatted);
    const extraZoomZonesForScene = extraZoomZones[sceneName] ?? [];
    return [mainZoomZone, ...extraZoomZonesForScene];
}
