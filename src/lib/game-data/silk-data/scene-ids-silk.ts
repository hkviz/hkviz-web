import { sceneNameToIdGeneratedSilk } from './scene-ids-silk.generated';

export const sceneNameToIdMetaSilk = sceneNameToIdGeneratedSilk;

export const sceneIdToSceneNameSilk: Map<number, string> = new Map(
	Object.entries(sceneNameToIdGeneratedSilk).map(([sceneName, sceneIdData]) => {
		return [sceneIdData.id, sceneName] as const;
	}),
);
