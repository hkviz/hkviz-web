import { MapZoneSilk } from './player-data/enum/mapzone-enum-silk.generated.ts';
import { sceneNameToIdGeneratedSilk } from './scene-ids-silk.generated.ts';

const sceneNameToData = new Map(
	Object.entries(sceneNameToIdGeneratedSilk).map(
		([sceneName, data]) => [sceneName.toLocaleLowerCase(), data.zone] as const,
	),
);
export function sceneNameGetZone(sceneName: string): MapZoneSilk | null {
	const sceneNameLower = sceneName.toLowerCase();
	const zoneIndex = sceneNameToData.get(sceneNameLower) ?? null;
	let zone = MapZoneSilk.byId[zoneIndex ?? -1] ?? null;

	// some zones are not marked correctly in the game data (not important for game, bc should only impact when bench is used in a room).
	// therefore we infer the zone based on the scene name, in some cases.
	if (sceneNameLower.startsWith('shadow_') || sceneNameLower === 'bellway_shadow') {
		zone = 'SWAMP';
	}
	if (sceneNameLower.startsWith('wisp_')) {
		zone = 'WISP';
	}
	if (sceneNameLower.startsWith('under_')) {
		zone = 'UNDERSTORE';
	}
	if (sceneNameLower === 'tube_hub') {
		zone = 'CRADLE';
	}
	return zone;
}
