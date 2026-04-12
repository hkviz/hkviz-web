import { createDeferred, createMemo, createSignal } from 'solid-js';
import { isServer } from 'solid-js/web';
import { GameModuleOfGame } from '~/lib/parser/game-module/game-module';
import { loadGameModule } from '~/lib/parser/game-module/load-game-module';
import { GameId } from '~/lib/types/game-ids';
import { createStoreInitializer } from '../store/store-initializer';
import { fetchWithRunfileCache, openRunfileCache } from './recording-file-browser-cache';
import { type RunFileInfo } from './run-files-info';
import { wrapResultWithProgress } from './wrap-result-with-progress';

async function loadFile<Game extends GameId>(
	parserModulePromise: Promise<GameModuleOfGame<Game>>,
	cache: Promise<Cache | null>,
	file: RunFileInfo,
	onProgress: (progress: number) => void,
) {
	const loader = () => fetchWithRunfileCache(cache, file.id, file.version, file.signedUrl);

	// uncomment to get file content from console. useful for debugging
	// very bad for performance, since context needs to be kept in memory.

	// (window as any)['fileLoader_' + combinedPartNumber] = loader;

	const response = await loader().then((it) =>
		wrapResultWithProgress(it, ({ loaded, total }) => {
			onProgress(total ? loaded / total : 0);
		}),
	);
	const parserModule = await parserModulePromise;
	const recording = await parserModule.parseRecordingFile(response, file.combinedPartNumber);
	return recording;
}

export interface RunFileLoader {
	progress: () => number;
	done: () => boolean;
	abort: () => void;
}

export function createRunFileLoader<Game extends GameId>(game: Game, files: RunFileInfo[]): RunFileLoader {
	if (isServer) {
		return {
			progress: () => 0,
			done: () => false,
			abort: () => {
				// do nothing
			},
		};
	}

	console.log('started loading run files');

	const abortController = new AbortController();
	const parserModulePromise = loadGameModule(game);

	const cache = openRunfileCache();
	const fileLoaders = files.map((file) => {
		const [progress, setProgress] = createSignal(0);
		return {
			progress,
			promise: loadFile<Game>(parserModulePromise, cache, file, setProgress),
		};
	});

	const progress = createMemo(() => {
		const totalProgress = fileLoaders.reduce((acc, { progress }) => acc + progress(), 0);
		return totalProgress / files.length;
	});

	const deferredProgress = createDeferred(progress, {
		timeoutMs: 100,
	});

	const [done, setDone] = createSignal(false);

	const storeInitializer = createStoreInitializer();
	storeInitializer.reset();

	void Promise.all(fileLoaders.map((it) => it.promise)).then(async (recordings) => {
		if (abortController.signal.aborted) return;
		const parserModule = await parserModulePromise;
		const combinedRecording = parserModule.combineRecordings(recordings as any);
		storeInitializer.initializeFromRecording(parserModule, combinedRecording);
		setDone(true);
	});

	return {
		progress: deferredProgress,
		done,
		abort: () => abortController.abort(),
	};
}
