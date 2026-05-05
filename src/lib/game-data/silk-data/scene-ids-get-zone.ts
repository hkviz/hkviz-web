import { MapZoneSilk } from './player-data/enum/mapzone-enum-silk.generated.ts';
import { sceneNameToIdGeneratedSilk } from './scene-ids-silk.generated.ts';

const sceneNameToData = new Map(
	Object.entries(sceneNameToIdGeneratedSilk).map(
		([sceneName, data]) => [sceneName.toLocaleLowerCase(), data.zone] as const,
	),
);
export function sceneNameGetZone(sceneName: string): MapZoneSilk | null {
	const zoneIndex = sceneNameToData.get(sceneName.toLocaleLowerCase()) ?? null;
	return MapZoneSilk.byId[zoneIndex ?? -1] ?? null;
}
