import { silkMapData } from './map-data-silk';
import { sceneNameToIdGeneratedSilk } from './scene-ids-silk.generated';
import { splitSuffixSceneNameSilk } from './sub-scene-names-silk';

function createSceneIdToSceneNameMap(): Map<number, string> {
	const sceneNameByLower = new Map(silkMapData.rooms.map((it) => [it.sceneName.toLowerCase(), it.sceneName]));

	return new Map(
		Object.entries(sceneNameToIdGeneratedSilk).map(([sceneName, sceneIdData]) => {
			// first try - exact match
			let name = sceneNameByLower.get(sceneName.toLowerCase());

			// second try - suffix
			if (!name) {
				const [nameWithoutSuffix, suffix] = splitSuffixSceneNameSilk(sceneName);
				if (suffix) {
					name = sceneNameByLower.get(nameWithoutSuffix.toLowerCase()) + suffix;
				}
			}
			// failed
			if (!name) {
				console.warn(`Scene name ${sceneName} with id ${sceneIdData.id} not found in map data`);
			}
			return [sceneIdData.id, name ?? sceneName] as const;
		}),
	);
}

export const sceneIdToSceneName: Map<number, string> = createSceneIdToSceneNameMap();
