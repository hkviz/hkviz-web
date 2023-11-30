import * as d3 from 'd3';
import { roomDataUnscaled } from '../generated/map-rooms.generated';
import { Bounds } from '../types/bounds';
import { Vector2 } from '../types/vector2';

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

export const roomData = roomDataUnscaled.rooms.map((room) => {
    const visualBounds = scaleBounds(room.visualBounds);
    const playerPositionBounds = scaleBounds(room.playerPositionBounds);

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
        visualBounds,
        playerPositionBounds,
        color,
        spritePosition: roomPositionWithPadding(room.spriteInfo),
        roughSpritePosition: room.roughSpriteInfo ? roomPositionWithPadding(room.roughSpriteInfo) : null,
    };
});

export const roomDataBySceneName = new Map<string, RoomData>(roomData.map((room) => [room.sceneName, room]));
