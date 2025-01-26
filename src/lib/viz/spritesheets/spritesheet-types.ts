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

export interface SpriteSheetExtractWorkerMessage {
	spritesheetUrl: string;
	metadataUrl: string;
}

export type SpriteSheetExtractWorkerResponse = Record<string, Blob>;
export type SpriteSheetExtracted = Record<string, string>;
