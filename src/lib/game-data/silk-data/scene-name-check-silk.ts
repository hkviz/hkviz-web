import { sceneNameToIdGeneratedSilk } from './scene-ids-silk.generated';

export function isActualSceneNameSilk(sceneName: string) {
	return (sceneNameToIdGeneratedSilk as any)[sceneName.toLocaleLowerCase()] != null;
}
