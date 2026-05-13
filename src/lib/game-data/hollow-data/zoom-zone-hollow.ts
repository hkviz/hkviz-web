import { type ZoneNameFormattedHollow } from './room-name-formatting-hollow';

export function zoomZoneHollow(zoneNameFormatted: ZoneNameFormattedHollow) {
	switch (zoneNameFormatted) {
		case 'Ancient Basin':
			return 'The Abyss' satisfies ZoneNameFormattedHollow;
		case 'Dirtmouth':
			return 'Forgotten Crossroads' satisfies ZoneNameFormattedHollow;
		case 'Hive':
			return "Kingdom's Edge" satisfies ZoneNameFormattedHollow;
		//case 'Royal Waterways':
		//	return 'City of Tears' satisfies ZoneNameFormattedHollow;
		default:
			return zoneNameFormatted;
	}
}

export type ZoomZoneHollow = ReturnType<typeof zoomZoneHollow>;

const extraZoomZonesHollow: Record<string, ZoomZoneHollow[]> = {
	Crossroads_11_alt: ['Greenpath'],
	Fungus2_01: ['Fog Canyon'], // Queens Station
	Fungus2_02: ['Fog Canyon'], // Queens Station
	Fungus2_34: ['Fog Canyon'], // Queens Station
	// Abyss_01: ['City of Tears'], // Long room between city and abyss located in royal waterways
	Fungus2_25: ['Fungal Wastes'], // Mantis Village entrance to deep nest
	Mines_01: ['Forgotten Crossroads'], // Crystal Peak entrance from dirtmouth
	Mines_10: ['Forgotten Crossroads'], // Crystal Peak entrance from dirtmouth
	Mines_16: ['Forgotten Crossroads'], // Crystal Peak entrance from dirtmouth
	Fungus1_11: ['Fog Canyon'], // Greenpath room path to bench
	Fungus1_37: ['Fog Canyon'], // Greenpath room path to bench
	Fungus2_23: [zoomZoneHollow('Royal Waterways')], // Manthis path to royal waterways
	Ruins2_04: [zoomZoneHollow('Royal Waterways')], // Path from Emilitia
	Abyss_02: [zoomZoneHollow('Royal Waterways'), zoomZoneHollow('City of Tears')],
	Deepnest_East_09: [zoomZoneHollow('City of Tears')], // elevator exit to colosseum
	Ruins2_07: [zoomZoneHollow("Kingdom's Edge")], // kings station to edge
	Ruins2_11_b: [zoomZoneHollow("Kingdom's Edge")], // kings station to edge
	Ruins2_11: [zoomZoneHollow("Kingdom's Edge")], // kings station to edge
	Ruins2_06: [zoomZoneHollow("Kingdom's Edge")], // kings station to edge
	Ruins2_08: [zoomZoneHollow("Kingdom's Edge")], // kings station to edge
	Fungus3_26: [zoomZoneHollow('Forgotten Crossroads')], // flower quest common entrance to fog canyon from crossroads
	Deepnest_01: [zoomZoneHollow('Deepnest')], // room in fungus
	Fungus1_28: [zoomZoneHollow('Greenpath')], // hive entrance from greenpath
	Waterways_14: [zoomZoneHollow("Kingdom's Edge")], // path at top of waterways to edge
	Fungus3_34: [zoomZoneHollow('Fog Canyon')], // near up spell collection
	Fungus3_44: [zoomZoneHollow("Queen's Gardens")],

	Crossroads_18: [zoomZoneHollow('Fungal Wastes')],
	Crossroads_52: [zoomZoneHollow('Fungal Wastes')],

	Fungus3_22: [zoomZoneHollow('Greenpath')],
	Fungus1_13: [zoomZoneHollow("Queen's Gardens")],
};

export const gameObjectNamesIgnoredInZoomZoneHollow = new Set([
	'Abyss_03_b', // tram passage, visual just on map, but can not be entered. Therefore no need to zoom to it.
]);

export function getZoomZonesHollow(
	sceneName: string,
	zoneNameFormatted: ZoneNameFormattedHollow,
): readonly ZoomZoneHollow[] {
	if (sceneName === 'Abyss_01') {
		return ['Royal Waterways' satisfies ZoneNameFormattedHollow];
	}

	const mainZoomZone = zoomZoneHollow(zoneNameFormatted);
	const extraZoomZonesForScene = extraZoomZonesHollow[sceneName] ?? [];
	return [mainZoomZone, ...extraZoomZonesForScene];
}
