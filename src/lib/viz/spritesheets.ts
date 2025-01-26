export interface SpriteSheetTileMeta {
	frame: {
		x: number;
		y: number;
		w: number;
		h: number;
	};
	rotated: boolean;
	trimmed: boolean;
	spriteSourceSize: {
		x: number;
		y: number;
		w: number;
		h: number;
	};
	sourceSize: {
		w: number;
		h: number;
	};
}
export interface SpriteSheetMeta {
	frames: Record<string, SpriteSheetTileMeta>;
	meta: {
		app: string;
		version: string;
		image: string;
		format: string;
		size: {
			w: number;
			h: number;
		};
		scale: number;
		related_multi_packs: unknown[];
	};
}
import mapJson from '../../../public/assets/map.png.json';

export const mapSpriteSheetMeta = mapJson as SpriteSheetMeta;
