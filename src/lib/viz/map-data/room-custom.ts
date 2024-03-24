import { assertNever } from '~/lib/utils/utils';
import { roomDataUnscaled } from '../generated/map-rooms.generated';

export type UnprocessedRoomInfo = (typeof roomDataUnscaled)['rooms'][number];

export type CustomRoomInfo = UnprocessedRoomInfo & {
    gameObjectNameNeededInVisited?: string;
};

interface MakeCustomRoomOptions {
    nextToRoom: UnprocessedRoomInfo;
    size: { x: number; y: number };
    scale: number;
}
interface MakeCustomRoomGetterOptions extends MakeCustomRoomOptions {
    makeSpriteInfo: (options: MakeSpriteInfoOptions) => UnprocessedRoomInfo['spriteInfo'];
    makeBounds: (options: MakeBoundsOptions) => UnprocessedRoomInfo['visualBounds'];
}

interface MakeSpriteInfoOptions {
    name: string;
}

type MakeBoundsOptions = ({ toLeft: number } | { toRight: number } | { alignLeft: number }) &
    ({ above: number } | { below: number } | { alignBottom: number });

function makeCustomRoom({ nextToRoom, size, scale }: MakeCustomRoomOptions) {
    return function (
        optionsGetter: (
            options: MakeCustomRoomGetterOptions,
        ) => Omit<
            CustomRoomInfo,
            | 'playerPositionBounds'
            | 'sprite'
            | 'spriteRough'
            | 'hasRoughVersion'
            | 'origColor'
            | 'gameObjectName'
            | 'mapZone'
            | 'roughSpriteInfo'
            | 'texts'
        > &
            Partial<CustomRoomInfo>,
    ): CustomRoomInfo {
        function makeSpriteInfo({ name }: MakeSpriteInfoOptions): UnprocessedRoomInfo['spriteInfo'] {
            return {
                name,
                size,
                padding: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0,
                    w: 0.0,
                },
            };
        }
        function makeBounds(options: MakeBoundsOptions) {
            const scaledSize = {
                x: size.x * scale,
                y: size.y * scale,
            };

            const bounds = {
                min: {
                    x: 0,
                    y: 0,
                    z: -0.129999161,
                },
                max: {
                    x: scaledSize.x,
                    y: scaledSize.y,
                    z: 0.129999161,
                },
            };

            if ('toLeft' in options) {
                bounds.min.x = nextToRoom.visualBounds.min.x - scaledSize.x - options.toLeft;
                bounds.max.x = nextToRoom.visualBounds.min.x - options.toLeft;
            } else if ('toRight' in options) {
                bounds.min.x = nextToRoom.visualBounds.max.x + options.toRight;
                bounds.max.x = nextToRoom.visualBounds.max.x + scaledSize.x + options.toRight;
            } else if ('alignLeft' in options) {
                bounds.min.x = nextToRoom.visualBounds.min.x + options.alignLeft;
                bounds.max.x = nextToRoom.visualBounds.min.x + options.alignLeft + scaledSize.x;
            } else {
                assertNever(options);
            }

            if ('above' in options) {
                bounds.min.y = nextToRoom.visualBounds.max.y + options.above;
                bounds.max.y = nextToRoom.visualBounds.min.y + options.above + scaledSize.y;
            } else if ('below' in options) {
                bounds.min.y = nextToRoom.visualBounds.min.y - scaledSize.y - options.below;
                bounds.max.y = nextToRoom.visualBounds.min.y - options.below;
            } else if ('alignBottom' in options) {
                bounds.min.y = nextToRoom.visualBounds.min.y + options.alignBottom;
                bounds.max.y = nextToRoom.visualBounds.min.y + options.alignBottom + scaledSize.y;
            } else {
                assertNever(options);
            }

            return bounds;
        }

        const options = optionsGetter({ nextToRoom, size, scale, makeSpriteInfo, makeBounds });
        return {
            ...options,
            playerPositionBounds: options.playerPositionBounds ?? options.visualBounds,
            sprite: options.sprite ?? options.spriteInfo.name,
            spriteRough: options.spriteRough ?? options.roughSpriteInfo?.name,
            hasRoughVersion: options.hasRoughVersion ?? !!options.spriteRough,
            gameObjectName: options.gameObjectName ?? options.sceneName,
            roughSpriteInfo: options.roughSpriteInfo ?? null,

            origColor: options.origColor ?? nextToRoom.origColor,
            mapZone: options.mapZone ?? nextToRoom.mapZone,
            texts: options.texts ?? [],
        } as CustomRoomInfo;
    };
}

function unscaledRoomByGameObjectName(name: string) {
    return roomDataUnscaled.rooms.find((it) => it.gameObjectName === name);
}

// Birthplace
const abysee15 = makeCustomRoom({
    nextToRoom: unscaledRoomByGameObjectName('Abyss_06_Core')!,
    size: { x: 403.0, y: 282.0 },
    scale: 1 / 90,
})(({ nextToRoom, makeSpriteInfo, makeBounds }) => {
    const visualBounds = makeBounds({ alignLeft: 0.4, below: 0.3 });
    const playerPositionBounds = {
        max: {
            ...visualBounds.max,
            x: visualBounds.max.x + 0.3,
        },
        min: {
            ...visualBounds.min,
            y: visualBounds.min.y - 0.05,
        },
    };

    return {
        sceneName: 'Abyss_15',
        spriteInfo: makeSpriteInfo({ name: 'custom/Abyss_15' }),
        origColor: {
            x: nextToRoom.origColor.x * 0.7,
            y: nextToRoom.origColor.y * 0.7,
            z: nextToRoom.origColor.z * 0.7,
            w: 1.0,
        },
        visualBounds,
        playerPositionBounds,
    };
});

// Colosseum of Fools
const roomBeforeColosseum = unscaledRoomByGameObjectName('Deepnest_East_09')!;
const colosseumBronze = makeCustomRoom({ nextToRoom: roomBeforeColosseum, size: { x: 62.0, y: 94.0 }, scale: 1 / 150 })(
    ({ makeSpriteInfo, makeBounds }) => {
        const visualBounds = makeBounds({ toRight: 0.2, alignBottom: 0 });
        return {
            sceneName: 'Room_Colosseum_Bronze',
            spriteInfo: makeSpriteInfo({ name: 'custom/Room_Colosseum_Bronze' }),
            visualBounds,
        };
    },
);
const colosseumSilver = makeCustomRoom({ nextToRoom: colosseumBronze, size: { x: 63.0, y: 107.0 }, scale: 1 / 150 })(({
    makeSpriteInfo,
    makeBounds,
}) => {
    const visualBounds = makeBounds({ toRight: -0.04, alignBottom: 0.02 });
    return {
        sceneName: 'Room_Colosseum_Silver',
        spriteInfo: makeSpriteInfo({ name: 'custom/Room_Colosseum_Silver' }),
        visualBounds,
    };
});

const colosseumGold = makeCustomRoom({ nextToRoom: colosseumSilver, size: { x: 63.0, y: 107.0 }, scale: 1 / 150 })(({
    makeSpriteInfo,
    makeBounds,
}) => {
    const visualBounds = makeBounds({ toRight: -0.04, alignBottom: 0 });
    return {
        sceneName: 'Room_Colosseum_Gold',
        spriteInfo: makeSpriteInfo({ name: 'custom/Room_Colosseum_Gold' }),
        visualBounds,
    };
});

const dirthmouth = unscaledRoomByGameObjectName('Town')!;
console.log({ dirthmouth });
const GRIMM_SCALE =
    (dirthmouth.playerPositionBounds.max.x - dirthmouth.playerPositionBounds.min.x) /
    (dirthmouth.spriteInfo.size.x + dirthmouth.spriteInfo.padding.x + dirthmouth.spriteInfo.padding.z);
const grimmTent = makeCustomRoom({ nextToRoom: dirthmouth, size: { x: 102.0, y: 89.0 }, scale: GRIMM_SCALE })(({
    makeSpriteInfo,
    makeBounds,
}) => {
    const visualBounds = makeBounds({ alignLeft: 52 * GRIMM_SCALE, alignBottom: 40 * GRIMM_SCALE });
    return {
        sceneName: 'Town',
        spriteInfo: makeSpriteInfo({ name: 'edited/Town_grimm_no_tent' }),
        visualBounds,
        gameObjectName: 'Town_grimm',
        gameObjectNameNeededInVisited: 'Town',
    };
});

export const customRoomData: CustomRoomInfo[] = [abysee15, colosseumBronze, colosseumSilver, colosseumGold, grimmTent];
