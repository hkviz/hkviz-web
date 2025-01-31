// this is a worker script

import {
	SpriteSheetExtractWorkerMessage,
	SpriteSheetExtractWorkerResponse,
	SpriteSheetMeta,
} from './spritesheet-types';

self.onmessage = async (event: MessageEvent<SpriteSheetExtractWorkerMessage>) => {
	const spriteData = await getAllSpritesAsDataURL(event.data);
	self.postMessage(spriteData);
};

async function loadSpriteSheet(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch spritesheet: ${response.statusText}`);
	}

	const blob = await response.blob();
	const bitmap = await createImageBitmap(blob);

	const sheetCanvas = new OffscreenCanvas(bitmap.width, bitmap.height);
	const sheetContext = sheetCanvas.getContext('2d');
	if (!sheetContext) {
		throw new Error('Failed to get 2D context from OffscreenCanvas.');
	}

	sheetContext.drawImage(bitmap, 0, 0);
	return [sheetCanvas, sheetContext] as const;
}

async function loadSpriteSheetMetadata(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch spritesheet metadata: ${response.statusText}`);
	}

	const json = (await response.json()) as SpriteSheetMeta;
	return json;
}

async function getAllSpritesAsDataURL(
	message: SpriteSheetExtractWorkerMessage,
): Promise<SpriteSheetExtractWorkerResponse> {
	const [[sheetCanvas, _sheetContext], metadata] = await Promise.all([
		loadSpriteSheet(message.spritesheetUrl),
		loadSpriteSheetMetadata(message.metadataUrl),
	]);

	const results: SpriteSheetExtractWorkerResponse = {};

	for (const [spriteName, spriteData] of Object.entries(metadata.frames)) {
		const tempCanvas = new OffscreenCanvas(spriteData.frame.w, spriteData.frame.h);
		const tempCtx = tempCanvas.getContext('2d');
		if (!tempCtx) {
			throw new Error(`Failed to get context for sprite: ${spriteName}`);
		}

		tempCtx.drawImage(
			sheetCanvas,

			// frame in sheet
			spriteData.frame.x,
			spriteData.frame.y,
			spriteData.frame.w,
			spriteData.frame.h,

			// frame in target
			0,
			0,
			spriteData.frame.w,
			spriteData.frame.h,
		);

		const blob = await tempCanvas.convertToBlob();

		results[spriteName] = blob;
	}

	return results;
}
