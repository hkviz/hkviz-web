import { silkMapDataGenerated } from './map-data-silk.generated.js';
import type { MapDataSilk } from './map-data-silk.types.js';

export const silkMapData: MapDataSilk = silkMapDataGenerated;

// sceneNames with multiple objects on map:
// Dust_09_into_citadel
// Bone_East_07
// Dock_02b_bot

function makeSceneGroups() {
	const groups = Map.groupBy(silkMapData.rooms, (it) => it.sceneName);

	groups.forEach((rooms) => {
		// Not ideal. probably has some logic behind it.
		let didSetMainGameObject = false;
		for (const room of rooms) {
			if (room.isMainGameObject === false) continue;
			if (didSetMainGameObject) {
				room.isMainGameObject = false;
			} else {
				room.isMainGameObject = true;
				didSetMainGameObject = true;
			}
		}
		if (!didSetMainGameObject) {
			console.warn(`No main game object found for scene ${rooms[0].sceneName}, defaulting to first one`);
			rooms[0].isMainGameObject = true;
		}
	});

	return groups;
}

export const mapDataAllBySceneNameSilk = makeSceneGroups();
export const mapDataMainBySceneNameSilk = new Map(
	mapDataAllBySceneNameSilk
		.entries()
		.map(([sceneName, rooms]) => [sceneName, rooms.find((r) => r.isMainGameObject) ?? rooms[0]] as const),
);
export const mapDataByGameObjectNameSilk = new Map(silkMapData.rooms.map((it) => [it.gameObjectName, it]));
