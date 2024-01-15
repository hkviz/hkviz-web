import type { SceneEvent } from '../recording-files/recording';
import { Vector2 } from '../types/vector2';
import { mainRoomDataBySceneName } from './rooms';

export function playerPositionToMapPosition(playerPosition: Vector2, sceneEvent: SceneEvent): Vector2 | undefined {
    const mapRoom = mainRoomDataBySceneName.get(sceneEvent.sceneName);
    if (!mapRoom || !sceneEvent.originOffset || !sceneEvent.sceneSize) return undefined;

    const { playerPositionBounds } = mapRoom;

    const scaledPlayerX = playerPosition.x + sceneEvent.originOffset.x;
    const scaledPlayerY = playerPosition.y + sceneEvent.originOffset.y;

    const x = playerPositionBounds.min.x + playerPositionBounds.size.x * (scaledPlayerX / sceneEvent.sceneSize.x);
    const y = playerPositionBounds.max.y - playerPositionBounds.size.y * (scaledPlayerY / sceneEvent.sceneSize.y);

    return new Vector2(x, y);
}
