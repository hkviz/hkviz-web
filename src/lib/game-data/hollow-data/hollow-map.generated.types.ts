import { SpriteInfoGenerated } from '../shared/sprite-info-generated';
import { Vector3Like, Vector4Like } from '../shared/vector-like';

export interface HollowMapRoomGenerated {
	sceneName: string;
	spriteInfo: SpriteInfoGenerated;
	roughSpriteInfo: SpriteInfoGenerated | null;
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

export interface HollowTextInfoGenerated {
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
