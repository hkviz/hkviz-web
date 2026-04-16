import { GlobalEnums_MapZoneSilk } from './player-data-silk.generated';
import { sceneNameToIdGeneratedSilk } from './scene-ids-silk.generated';

const sceneNameToData = new Map(
	Object.entries(sceneNameToIdGeneratedSilk).map(([sceneName, data]) => [sceneName, data.zone] as const),
);
export function sceneNameGetZone(sceneName: string): GlobalEnums_MapZoneSilk | null {
	const zoneIndex = sceneNameToData.get(sceneName.toLocaleLowerCase()) ?? null;
	return GlobalEnums_MapZoneSilk.byId[zoneIndex ?? -1] ?? null;
}
