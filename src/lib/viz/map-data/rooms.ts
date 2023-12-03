import * as d3 from 'd3';
import { roomDataUnscaled } from '../generated/map-rooms.generated';
import { Bounds } from '../types/bounds';
import { Vector2 } from '../types/vector2';
import { formatZoneAndRoomName } from './room-name-formatting';

export const SCALE_FACTOR = 1;

export function scale(value: number) {
    return value * SCALE_FACTOR;
}

export type RoomData = (typeof roomData)[number];
export type SpriteInfo = RoomData['spriteInfo'];

export function scaleBounds(bounds: { min: { x: number; y: number }; max: { x: number; y: number } }): Bounds {
    const min = new Vector2(
        scale(bounds.min.x),
        scale(-bounds.max.y), // since y is inverted between svg and unity
    );

    const max = new Vector2(
        scale(bounds.max.x),
        scale(-bounds.min.y), // since y is inverted between svg and unity
    );

    return Bounds.fromMinMax(min, max);
}

// some rooms have multiple game objects, we need the 'main' one, which is used to determine how to map onto the map.
// In the game this will always be the one with the shortest name, since additional sprites for a room
// contain a suffix like Crossroads_04 and Crossroads_04_b
const mainGameObjectNamePerSceneName = Object.fromEntries(
    [...d3.group(roomDataUnscaled.rooms, (d) => d.sceneName).entries()].map(([sceneName, roomGroup]) => {
        return [
            sceneName,
            roomGroup.sort((a, b) => a.gameObjectName.length - b.gameObjectName.length)[0]!.gameObjectName,
        ];
    }),
);

export const roomData = roomDataUnscaled.rooms.map((room) => {
    const visualBounds = scaleBounds(room.visualBounds);
    const playerPositionBounds = scaleBounds(room.playerPositionBounds);
    const isMainGameObject = room.gameObjectName === mainGameObjectNamePerSceneName[room.sceneName];

    function roomPositionWithPadding(
        spriteInfo: Exclude<typeof room.roughSpriteInfo | typeof room.spriteInfo, null | undefined>,
    ) {
        const widthScaler = visualBounds.size.x / spriteInfo.size.x;
        const heightScaler = visualBounds.size.y / spriteInfo.size.y;

        const min = new Vector2(
            visualBounds.min.x + spriteInfo.padding.x * widthScaler,
            visualBounds.min.y + spriteInfo.padding.w * heightScaler,
        );
        const size = new Vector2(
            visualBounds.size.x - (spriteInfo.padding.x + spriteInfo.padding.z) * widthScaler,
            visualBounds.size.y - (spriteInfo.padding.y + spriteInfo.padding.w) * heightScaler,
        );

        return Bounds.fromMinSize(min, size);
    }

    // extra handling of additional map mod:
    const color =
        room.mapZone === 'GODS_GLORY'
            ? d3.color('#f8ecd7')!
            : room.mapZone === 'WHITE_PALACE'
            ? d3.color('#dfe2e4')!
            : d3.rgb(room.origColor.x * 255, room.origColor.y * 255, room.origColor.z * 255);

    return {
        ...room,
        ...formatZoneAndRoomName(room.mapZone, room.sceneName),
        visualBounds,
        playerPositionBounds,
        color,
        isMainGameObject,
        spritePosition: roomPositionWithPadding(room.spriteInfo),
        roughSpritePosition: room.roughSpriteInfo ? roomPositionWithPadding(room.roughSpriteInfo) : null,
    };
});

export const mainRoomDataBySceneName = new Map<string, RoomData>(
    roomData.filter((it) => it.isMainGameObject).map((room) => [room.sceneName, room]),
);
