import { type Vector2Like, type Vector3Like, type Vector4Like } from './types';

export interface SpriteInfoUnscaled {
    name: string;
    size: Vector2Like;
    padding: Vector4Like;
}

export interface MapRoomUnscaled {
    sceneName: string;
    spriteInfo: SpriteInfoUnscaled;
    roughSpriteInfo: SpriteInfoUnscaled | null;
    gameObjectName: string;
    mapZone: string;
    origColor: Vector4Like;
    visualBounds: {
        min: Vector3Like;
        max: Vector3Like;
    };
    playerPositionBounds: {
        min: Vector3Like;
        max: Vector3Like;
    };
    sprite: string;
    spriteRough: string | null;
    hasRoughVersion: boolean;
    texts: {
        objectPath: string;
        convoName: string;
        sheetName: string;
        position: Vector3Like;
        fontSize: number;
        fontWeight: number;
        bounds: {
            min: {
                x: number;
                y: number;
                z: number;
            };
            max: {
                x: number;
                y: number;
                z: number;
            };
        };
        origColor: {
            x: number;
            y: number;
            z: number;
            w: number;
        };
    }[];
}

export interface TextInfoUnscaled {
    objectPath: string;
    convoName: string;
    sheetName: string;
    position: Vector3Like;
    fontSize: number;
    fontWeight: number;
    bounds: {
        min: Vector3Like;
        max: Vector3Like;
    };
    origColor: Vector4Like;
}
