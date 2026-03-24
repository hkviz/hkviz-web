import { createContext, createSignal, useContext } from 'solid-js';
import { isServer } from 'solid-js/web';
import { assertNever } from '~/lib/parser';
import {
	SpriteSheetExtracted,
	SpriteSheetExtractWorkerMessage,
	SpriteSheetExtractWorkerResponse,
} from './spritesheet-types';

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

const HOLLOW_MAP_SHEET_ID = 'hollow-map';
const SILK_MAP_SHEET_ID = 'silk-map';

export function createSpriteSheetStore() {
	// currently only handles a single spritesheet
	const [hollowMapSheetData, setHollowSheetData] = createSignal<SpriteSheetExtracted>({});
	const [silkMapSheetData, setSilkSheetData] = createSignal<SpriteSheetExtracted>({});

	let hollowLoaded = false;
	let silkLoaded = false;

	let ensureLoaded = (_map: 'hollow' | 'silk') => {
		// noop
	};

	if (!isServer) {
		let worker: Worker | null = null;
		worker = new Worker(new URL('./spritesheet-extractor.worker.ts', import.meta.url), { type: 'module' });

		worker.onmessage = (event) => {
			const response = event.data as SpriteSheetExtractWorkerResponse;
			console.log({ sprites: response });

			if (response.id === HOLLOW_MAP_SHEET_ID) {
				setHollowSheetData(
					Object.fromEntries(
						Object.entries(response.frames).map(([name, sprite]) => [name, URL.createObjectURL(sprite)]),
					),
				);
			} else if (response.id === SILK_MAP_SHEET_ID) {
				setSilkSheetData(
					Object.fromEntries(
						Object.entries(response.frames).map(([name, sprite]) => [name, URL.createObjectURL(sprite)]),
					),
				);
			} else {
				console.warn(`Unknown spritesheet ID results received from worker: ${response.id}`);
			}
		};
		ensureLoaded = (map) => {
			if (map === 'hollow') {
				if (hollowLoaded) {
					return;
				}
				hollowLoaded = true;
				const message: SpriteSheetExtractWorkerMessage = {
					id: HOLLOW_MAP_SHEET_ID,
					spritesheetUrl: '/assets/map.webp',
					metadataUrl: '/assets/map.webp.json',
				};
				worker.postMessage(message);
			} else if (map === 'silk') {
				if (silkLoaded) {
					return;
				}
				silkLoaded = true;
				const message: SpriteSheetExtractWorkerMessage = {
					id: SILK_MAP_SHEET_ID,
					spritesheetUrl: '/assets/silk-map.webp',
					metadataUrl: '/assets/silk-map.webp.json',
				};
				worker.postMessage(message);
			} else {
				assertNever(map);
			}
		};
	}

	return {
		hollowMapSheetData,
		silkMapSheetData,
		ensureLoaded,
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
