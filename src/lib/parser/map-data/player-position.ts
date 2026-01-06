import { Vector2 } from '../hk-types';
import { type SceneEvent } from '../recording-files/events/scene-event';
import { mainRoomDataBySceneName } from './rooms';

export function playerPositionToMapPosition(
	playerPosition: Vector2,
	sceneEvent: SceneEvent | undefined,
): Vector2 | undefined {
	if (!sceneEvent) return undefined;

	const mapRoom = mainRoomDataBySceneName.get(sceneEvent.getMainVirtualSceneName());
	if (!mapRoom || !sceneEvent.originOffset || !sceneEvent.sceneSize) return undefined;

	const { playerPositionBounds } = mapRoom;

	const scaledPlayerX = playerPosition.x + sceneEvent.originOffset.x;
	const scaledPlayerY = playerPosition.y + sceneEvent.originOffset.y;

	const x = playerPositionBounds.min.x + playerPositionBounds.size.x * (scaledPlayerX / sceneEvent.sceneSize.x);
	const y = playerPositionBounds.max.y - playerPositionBounds.size.y * (scaledPlayerY / sceneEvent.sceneSize.y);

	return new Vector2(x, y);
}
