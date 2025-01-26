import { createContext, createSignal, onMount, useContext } from 'solid-js';
import { SpriteSheetExtracted } from './spritesheet-types';
import { SpriteSheetExtractWorkerMessage, SpriteSheetExtractWorkerResponse } from './spritesheet-types';
import { isServer } from 'solid-js/web';

/**
 * You might be wondering, why all this complexity?
 * I tried a few solutions for loading the many map sprites, and this one was the first one that was good enough
 * and did not create a request for each sprite.
 *
 * It still needs a couple requests per sprite sheet. (one for the sheet, one for the metadata)
 * Also one extra request for the worker.
 *
 * The worker loads the sheet and metadata and then creates a canvas for each sprite, draws the sprite on the canvas
 * and then converts the canvas to a blob. This blob is then sent back to the main thread.
 */

// to not delay loading the sprites, the worker is immediately created,
// and possible results are queued until the store is mounted
const queuedMessages: SpriteSheetExtracted[] = [];
let messageHandler = (extractedSheet: SpriteSheetExtracted) => {
	console.log('handling queue sheet');
	queuedMessages.push(extractedSheet);
};
if (!isServer) {
	let worker: Worker | null = null;
	worker = new Worker(new URL('./spritesheet-extractor-worker.ts', import.meta.url), { type: 'module' });
	const message: SpriteSheetExtractWorkerMessage = {
		spritesheetUrl: '/assets/map.webp',
		metadataUrl: '/assets/map.webp.json',
	};
	worker.postMessage(message);
	worker.onmessage = (event) => {
		const sprites = event.data as SpriteSheetExtractWorkerResponse;
		console.log({ sprites });

		messageHandler(
			Object.fromEntries(Object.entries(sprites).map(([name, sprite]) => [name, URL.createObjectURL(sprite)])),
		);
	};
}

export function createSpriteSheetStore() {
	// currently only handles a single spritesheet
	const [mapSheetData, setSheetData] = createSignal<SpriteSheetExtracted>({});

	onMount(() => {
		messageHandler = (extractedSheet) => {
			console.log('handling unqueued sheet');
			setSheetData(extractedSheet);
		};
		queuedMessages.forEach((msg) => setSheetData(msg));
	});

	return {
		mapSheetData,
	};
}

export type SpriteSheetStore = ReturnType<typeof createSpriteSheetStore>;
export const SpriteStoreContext = createContext<SpriteSheetStore>();
export function useSpriteSheetStore() {
	const store = useContext(SpriteStoreContext);
	if (!store) {
		throw new Error('SpriteSheetStore not in context');
	}
	return store;
}
