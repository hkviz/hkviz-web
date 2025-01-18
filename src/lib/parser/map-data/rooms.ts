import { roomDataConditionalByGameObjectName, roomDataUnscaled, roomDataUnscaledFinishedGame } from '../../hk-data';
import * as d3 from 'd3';
import { Bounds, Vector2 } from '../hk-types';
import { prepareTextExportData } from './area-names';
import { customRoomData, type CustomRoomInfo, type UnprocessedRoomInfo } from './room-custom';
import { roomGroupByName } from './room-groups';
import { formatZoneAndRoomName } from './room-name-formatting';
import { getSubSprites } from './room-sub-sprites';
import { scaleBounds } from './scaling';
import { getZoomZones } from './zoom-zone';
import { omit } from '../util';

const roomDataUnscaledWithCustom: Array<UnprocessedRoomInfo | CustomRoomInfo> = [
    ...roomDataUnscaled.rooms,
    ...customRoomData,
];

// some order changes, so hover works better:
const resortings = [
    {
        move: 'Waterways_07',
        after: 'Waterways_14',
    },
    {
        move: 'Fungus3_48_top',
        after: 'Fungus3_48',
    },
    {
        move: 'White_Palace_19',
        after: 'White_Palace_20',
    },
    {
        move: 'White_Palace_17',
        after: 'White_Palace_19',
    },
];

resortings.forEach((resort) => {
    const moveIndex = roomDataUnscaledWithCustom.findIndex((it) => it.gameObjectName === resort.move);
    const afterIndex = roomDataUnscaledWithCustom.findIndex((it) => it.gameObjectName === resort.after);
    const move = roomDataUnscaledWithCustom.splice(moveIndex, 1)[0]!;
    roomDataUnscaledWithCustom.splice(afterIndex + 1, 0, move);
});

// logPossibleConditionals();

export type RoomData = (typeof roomData)[number];
export type SpriteVariants = RoomData['spritesByVariant'];
export type SpriteInfo = SpriteVariants['normal'] | SpriteVariants['rough'];

// some rooms have multiple game objects, we need the 'main' one, which is used to determine how to map onto the map.
// In the game this will always be the one with the shortest name, since additional sprites for a room
// contain a suffix like Crossroads_04 and Crossroads_04_b
const mainGameObjectNamePerSceneName = Object.fromEntries(
    [...d3.group(roomDataUnscaledWithCustom, (d) => d.sceneName).entries()].map(([sceneName, roomGroup]) => {
        return [
            sceneName,
            roomGroup.sort((a, b) => a.gameObjectName.length - b.gameObjectName.length)[0]!.gameObjectName,
        ];
    }),
);

export type RoomSpriteVariant = 'rough' | 'normal' | 'conditional';

const finishedUnprocessedRoomsByGameObjectName = new Map(
    roomDataUnscaledFinishedGame.rooms.map((room) => [room.gameObjectName, room] as const),
);

export const roomData = roomDataUnscaledWithCustom.flatMap((room) => {
    const finishedRoom = finishedUnprocessedRoomsByGameObjectName.get(room.gameObjectName);
    const visualBounds = scaleBounds(room.visualBounds);
    const playerPositionBounds = scaleBounds(finishedRoom?.playerPositionBounds ?? room.playerPositionBounds);
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
        return {
            ...spriteInfo,
            nameWithoutSubSprites: null as null | string,
            scaledPosition: roomPositionWithPadding(spriteInfo),
            variant,
            alwaysHidden: false,
        };
    }

    // extra handling of additional map mod:
    const color = d3.hsl(
        room.mapZone === 'GODS_GLORY'
            ? d3.color('#f8ecd7')!
            : room.mapZone === 'WHITE_PALACE'
              ? d3.color('#dfe2e4')!
              : d3.rgb(room.origColor.x * 255, room.origColor.y * 255, room.origColor.z * 255),
    );

    const conditionalSpriteInfo = roomDataConditionalByGameObjectName(room.gameObjectName);

    const spritesByVariant = {
        normal: spriteInfoWithScaledPosition('normal', room.spriteInfo),
        conditional: conditionalSpriteInfo ? spriteInfoWithScaledPosition('conditional', conditionalSpriteInfo) : null,
        rough: room.roughSpriteInfo ? spriteInfoWithScaledPosition('rough', room.roughSpriteInfo) : null,
    };
    const sprites = Object.values(spritesByVariant).filter((it): it is NonNullable<typeof it> => !!it);
    const allSpritesScaledPositionBounds = Bounds.fromContainingBounds(sprites.map((it) => it.scaledPosition));

    const texts = room.texts.map((text) => prepareTextExportData(text));

    const names = formatZoneAndRoomName(room.mapZone, room.sceneName);
    const zoomZones = getZoomZones(room.sceneName, names.zoneNameFormatted);

    const roomCorrected = {
        ...omit(room, ['sprite', 'spriteInfo']),
        ...names,
        zoomZones,
        spritesByVariant,
        sprites,
        allSpritesScaledPositionBounds,
        visualBounds,
        playerPositionBounds,
        color,
        isMainGameObject,
        gameObjectNameNeededInVisited:
            'gameObjectNameNeededInVisited' in room && room.gameObjectNameNeededInVisited
                ? room.gameObjectNameNeededInVisited
                : room.gameObjectName,
        texts,
        subSpriteOfGameObjectName: null as null | string,
    };

    const subSprites = getSubSprites(room.spriteInfo.name);
    if (subSprites) {
        const { normal, conditional, rough } = subSprites.parentSpriteWithoutSubSprites;
        if (normal) {
            roomCorrected.spritesByVariant.normal.nameWithoutSubSprites = normal;
        }
        if (conditional) {
            roomCorrected.spritesByVariant.conditional!.nameWithoutSubSprites = conditional;
        }
        if (rough) {
            roomCorrected.spritesByVariant.rough!.nameWithoutSubSprites = rough;
        }
    }
    const subSpritesCorrected = (subSprites?.childSprites ?? []).map((childSprite) => {
        function subSpriteInfoWithScaledPosition<TVariant extends RoomSpriteVariant>(
            variant: TVariant,
        ): (typeof roomCorrected.spritesByVariant)[TVariant] {
            const parentSpriteInfo = spritesByVariant[variant as RoomSpriteVariant];
            const childVariant = childSprite[variant];

            if (!childVariant || !parentSpriteInfo) {
                return null!;
            }

            const parentSpriteSizeWithoutPadding = new Vector2(
                parentSpriteInfo.size.x - parentSpriteInfo.padding.x - parentSpriteInfo.padding.z,
                parentSpriteInfo.size.y - parentSpriteInfo.padding.y - parentSpriteInfo.padding.w,
            );

            const subSpriteInfo = {
                name: childVariant.name,
                nameWithoutSubSprites: null as null | string,
                variant,
                size: childVariant.size,
                padding: parentSpriteInfo.padding,
                scaledPosition: Bounds.fromMinSize(
                    new Vector2(
                        parentSpriteInfo.scaledPosition.min.x +
                            childVariant.offsetTop.x *
                                (parentSpriteInfo.scaledPosition.size.x / parentSpriteSizeWithoutPadding.x),

                        parentSpriteInfo.scaledPosition.min.y +
                            childVariant.offsetTop.y *
                                (parentSpriteInfo.scaledPosition.size.y / parentSpriteSizeWithoutPadding.y),
                    ),
                    new Vector2(
                        childVariant.size.x *
                            (parentSpriteInfo.scaledPosition.size.x / parentSpriteSizeWithoutPadding.x),
                        childVariant.size.y *
                            (parentSpriteInfo.scaledPosition.size.y / parentSpriteSizeWithoutPadding.y),
                    ),
                ),
                alwaysHidden: 'alwaysHidden' in childVariant ? (childVariant.alwaysHidden as boolean) : false,
            } satisfies typeof parentSpriteInfo;

            if ('conditionalOn' in parentSpriteInfo) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (subSpriteInfo as any).conditionalOn = parentSpriteInfo.conditionalOn;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return subSpriteInfo as any;
        }

        const subSpritesByVariant = {
            normal: subSpriteInfoWithScaledPosition('normal'),
            conditional: subSpriteInfoWithScaledPosition('conditional'),
            rough: subSpriteInfoWithScaledPosition('rough'),
        } as (typeof roomCorrected)['spritesByVariant'];

        const subSprites = Object.values(subSpritesByVariant).filter((it): it is NonNullable<typeof it> => !!it);

        const escapedSpriteName = childSprite.normal.name.replace(/\//g, '_');

        const visualBounds = Bounds.fromContainingBounds(subSprites.map((it) => it.scaledPosition));
        const playerPositionBounds = visualBounds;
        const allSpritesScaledPositionBounds = visualBounds;

        return {
            ...roomCorrected,
            ...formatZoneAndRoomName(room.mapZone, childSprite.sceneName),
            sceneName: childSprite.sceneName,
            gameObjectName:
                roomCorrected.gameObjectName +
                '_' +
                ('gameObjectName' in childSprite ? (childSprite.gameObjectName as string) : escapedSpriteName),
            spritesByVariant: subSpritesByVariant,
            sprites: subSprites,
            gameObjectNameNeededInVisited: roomCorrected.gameObjectNameNeededInVisited,
            isMainGameObject: true,
            visualBounds,
            playerPositionBounds,
            allSpritesScaledPositionBounds,
            subSpriteOfGameObjectName: roomCorrected.gameObjectName,
        } satisfies typeof roomCorrected;
    });

    return [roomCorrected, ...subSpritesCorrected];
});

export type RoomInfo = (typeof roomData)[number];

export const roomDataByGameObjectName = new Map<string, RoomData>(
    roomData.map((room) => [room.gameObjectName, room] as const),
);

export const mainRoomDataBySceneName = new Map<string, RoomData>(
    roomData
        .filter((it) => it.isMainGameObject)
        .flatMap((room) => {
            const self = [room.sceneName, room] as const;
            const groupChildren = roomGroupByName.get(room.sceneName as never)?.sceneNames ?? [];
            return [self, ...groupChildren.map((scene) => [scene, room] as const)];
        }),
);

export const allRoomDataBySceneName = new Map<string, RoomData[]>(
    [...d3.group(roomData, (d) => d.sceneName).entries()].flatMap(([sceneName, rooms]) => {
        const self = [sceneName, rooms] as const;
        const groupChildren = roomGroupByName.get(sceneName as never)?.sceneNames ?? [];
        return [self, ...groupChildren.map((scene) => [scene, rooms] as const)];
    }),
);

export const allRoomDataIncludingSubspritesBySceneName = (() => {
    const map = new Map<string, RoomData[]>();
    function add(room: RoomData, sceneName: string) {
        let arr = map.get(sceneName);
        if (!arr) {
            arr = [];
            map.set(sceneName, arr);
        }
        arr.push(room);
    }

    roomData.forEach((room) => {
        add(room, room.sceneName);
        if (room.subSpriteOfGameObjectName) {
            const other = roomDataByGameObjectName.get(room.subSpriteOfGameObjectName)!;
            add(room, other.sceneName);
        }
    });

    return map;
})();
