import { silkMapData } from './map-data-silk';
import { sceneNameToId } from './scene-ids.generated';

function createSceneIdToSceneNameMap(): Map<number, string> {
	const sceneNameByLower = new Map(silkMapData.rooms.map((it) => [it.sceneName.toLowerCase(), it.sceneName]));

	return new Map(
		Object.entries(sceneNameToId).map(([sceneName, sceneId]) => {
			const name = sceneNameByLower.get(sceneName.toLowerCase());
			if (!name) {
				console.warn(`Scene name ${sceneName} with id ${sceneId} not found in map data`);
			}
			return [sceneId, name ?? sceneName] as const;
		}),
	);
}

export const sceneIdToSceneName: Map<number, string> = createSceneIdToSceneNameMap();
