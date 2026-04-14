import { sceneNameToId } from './scene-ids-silk.generated';

export function isActualSceneNameSilk(sceneName: string) {
	return (sceneNameToId as any)[sceneName.toLocaleLowerCase()] != null;
}
