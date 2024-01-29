import { roomDataUnscaled } from '../generated/map-rooms.generated';

type UnprocessedRoomInfo = (typeof roomDataUnscaled)['rooms'][number];

type CustomRoomInfo = UnprocessedRoomInfo;

function makeCustomRoomInfo(
    options: Omit<CustomRoomInfo, 'playerPositionBounds'> & Partial<CustomRoomInfo>,
): CustomRoomInfo {
    return {
        ...options,
        playerPositionBounds: options.playerPositionBounds ?? options.visualBounds,
    } as CustomRoomInfo;
}

function unscaledRoomByGameObjectName(name: string) {
    return roomDataUnscaled.rooms.find((it) => it.gameObjectName === name);
}

const abyss06Core = unscaledRoomByGameObjectName('Abyss_06_Core')!;

const abysee15Size = { x: 403.0, y: 282.0 };
const abysee15Scale = 1 / 90; //1 / 100;
const abysee15VisualBounds = {
    min: {
        x: abyss06Core.visualBounds.min.x + 0.4,
        y: abyss06Core.visualBounds.min.y - abysee15Size.y * abysee15Scale,
        z: -0.129999161,
    },
    max: {
        x: abyss06Core.visualBounds.min.x + 0.4 + abysee15Size.x * abysee15Scale,
        y: abyss06Core.visualBounds.min.y,
        z: 0.129999161,
    },
};
const abysee15PlayerPositionBounds = {
    ...abysee15VisualBounds,
    max: {
        ...abysee15VisualBounds.max,
        x: abysee15VisualBounds.max.x + 0.3,
    },
    min: {
        ...abysee15VisualBounds.min,
        y: abysee15VisualBounds.min.y - 0.05,
    },
};

const abysee15 = makeCustomRoomInfo({
    sceneName: 'Abyss_15',
    spriteInfo: {
        name: 'custom/Abyss_15',
        size: abysee15Size,
        padding: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
            w: 0.0,
        },
    },
    roughSpriteInfo: null,
    gameObjectName: 'Abyss_15',
    mapZone: 'ABYSS',
    origColor: {
        x: abyss06Core.origColor.x * 0.7,
        y: abyss06Core.origColor.y * 0.7,
        z: abyss06Core.origColor.z * 0.7,
        w: 1.0,
    },
    visualBounds: abysee15VisualBounds,
    playerPositionBounds: abysee15PlayerPositionBounds,
    sprite: 'custom/Abyss_15',
    spriteRough: null,
    hasRoughVersion: false,
});

export const customRoomData: CustomRoomInfo[] = [abysee15];
