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
    Mines_10: ['Forgotten Crossroads'], // Crystal Peak entrance from dirthmouth
    Mines_16: ['Forgotten Crossroads'], // Crystal Peak entrance from dirthmouth
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
};

export function getZoomZones(sceneName: string, zoneNameFormatted: ZoneNameFormatted): readonly ZoomZone[] {
    const mainZoomZone = zoomZone(zoneNameFormatted);
    const extraZoomZonesForScene = extraZoomZones[sceneName] ?? [];
    return [mainZoomZone, ...extraZoomZonesForScene];
}
