import { Vector2 } from '~/lib/game-data/shared/vector2';
import { type SceneEvent } from '../../parser/recording-files/events-shared/scene-event';
import { mainRoomDataBySceneNameHollow } from './map-data-hollow';

export function playerPositionToMapPositionHollow(
	playerPosition: Vector2,
	sceneEvent: SceneEvent | undefined,
): Vector2 | undefined {
	if (!sceneEvent) return undefined;

	const mapRoom = mainRoomDataBySceneNameHollow.get(sceneEvent.getMainVirtualSceneName());
	if (!mapRoom || !sceneEvent.originOffset || !sceneEvent.sceneSize) return undefined;

	const { playerPositionBounds } = mapRoom;

	const scaledPlayerX = playerPosition.x + sceneEvent.originOffset.x;
	const scaledPlayerY = playerPosition.y + sceneEvent.originOffset.y;

	const x = playerPositionBounds.minX + playerPositionBounds.sizeX * (scaledPlayerX / sceneEvent.sceneSize.x);
	const y = playerPositionBounds.maxY - playerPositionBounds.sizeY * (scaledPlayerY / sceneEvent.sceneSize.y);

	return new Vector2(x, y);
}
