import { sceneNameToId } from './scene-ids.generated';

export const sceneIdToSceneName: Map<number, string> = new Map(
	Object.entries(sceneNameToId).map(([sceneName, sceneId]) => [sceneId, sceneName] as const),
);
