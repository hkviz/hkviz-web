import { Vector2 } from '~/lib/game-data/shared/vectors';
import { type SceneEvent } from '../../parser/recording-files/events-shared/scene-event';
import { mapDataBySceneNameSilk } from './map-data-silk';

export function playerPositionToMapPositionSilk(
	playerPosition: Vector2,
	sceneEvent: SceneEvent | undefined,
): Vector2 | undefined {
	if (!sceneEvent) return undefined;

	const mapRoom = mapDataBySceneNameSilk.get(sceneEvent.getMainVirtualSceneName());
	const playerPositionBounds = mapRoom?.playerPositionBounds;
	if (!mapRoom || !sceneEvent.originOffset || !sceneEvent.sceneSize || !playerPositionBounds) return undefined;

	const scaledPlayerX = playerPosition.x + sceneEvent.originOffset.x;
	const scaledPlayerY = playerPosition.y + sceneEvent.originOffset.y;

	const x = playerPositionBounds.min.x + playerPositionBounds.size.x * (scaledPlayerX / sceneEvent.sceneSize.x);
	const y = playerPositionBounds.max.y - playerPositionBounds.size.y * (scaledPlayerY / sceneEvent.sceneSize.y);

	return new Vector2(x, y);
}
