import * as d3 from 'd3';
import { roomDataUnscaled } from '../generated/map-rooms.generated';
import { Bounds } from '../types/bounds';
import { Vector2 } from '../types/vector2';
import { formatZoneAndRoomName } from './room-name-formatting';
import { roomDataConditionalByGameObjectName } from '../generated/map-rooms-conditionals.generated';

// logPossibleConditionals();

/**
 * Everything on the ingame map is scaled up,
 * from the unity units, since those are quite small
 * and break the mouse over / click targets.
 */
export const SCALE_FACTOR = 10;

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

export type RoomSpriteVariant = 'rough' | 'normal' | 'conditional';

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

    function spriteInfoWithScaledPosition<
        T extends Exclude<typeof room.roughSpriteInfo | typeof room.spriteInfo, null | undefined>,
    >(variant: RoomSpriteVariant, spriteInfo: T) {
        return { ...spriteInfo, scaledPosition: roomPositionWithPadding(spriteInfo), variant };
    }

    // extra handling of additional map mod:
    const color =
        room.mapZone === 'GODS_GLORY'
            ? d3.color('#f8ecd7')!
            : room.mapZone === 'WHITE_PALACE'
            ? d3.color('#dfe2e4')!
            : d3.rgb(room.origColor.x * 255, room.origColor.y * 255, room.origColor.z * 255);

    const conditionalSpriteInfo = roomDataConditionalByGameObjectName(room.gameObjectName);

    const spritesByVariant = {
        normal: spriteInfoWithScaledPosition('normal', room.spriteInfo),
        conditional: conditionalSpriteInfo ? spriteInfoWithScaledPosition('conditional', conditionalSpriteInfo) : null,
        rough: room.roughSpriteInfo ? spriteInfoWithScaledPosition('rough', room.roughSpriteInfo) : null,
    };
    const sprites = Object.values(spritesByVariant).filter((it): it is NonNullable<typeof it> => !!it);
    const allSpritesScaledPositionBounds = Bounds.fromContainingBounds(sprites.map((it) => it.scaledPosition));

    return {
        ...room,
        ...formatZoneAndRoomName(room.mapZone, room.sceneName),
        spritesByVariant,
        sprites,
        allSpritesScaledPositionBounds,
        visualBounds,
        playerPositionBounds,
        color,
        isMainGameObject,
    };
});

export type RoomInfo = (typeof roomData)[number];

export const mainRoomDataBySceneName = new Map<string, RoomData>(
    roomData.filter((it) => it.isMainGameObject).map((room) => [room.sceneName, room]),
);

export const allRoomDataBySceneName = new Map<string, RoomData[]>(
    [...d3.group(roomData, (d) => d.sceneName).entries()].map(([sceneName, rooms]) => [sceneName, rooms]),
);
