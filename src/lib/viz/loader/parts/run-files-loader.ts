import {
	CombinedRecording,
	combineRecordings,
	ParsedRecording,
	parseRecordingFile,
	ParseRecordingFileContext,
} from '../../../parser';
import { createDeferred, createMemo, createSignal, onMount } from 'solid-js';
import { fetchWithRunfileCache, openRunfileCache } from './recording-file-browser-cache';
import { type RunFileInfo } from './run-files-info';
import { wrapResultWithProgress } from './wrap-result-with-progress';
import { isServer } from 'solid-js/web';
import { createStoreInitializer } from '../../store/store-initializer';

async function loadFile(cache: Promise<Cache | null>, file: RunFileInfo, onProgress: (progress: number) => void) {
	const loader = () => fetchWithRunfileCache(cache, file.id, file.version, file.signedUrl);

	// uncomment to get file content from console. useful for debugging
	// very bad for performance, since context needs to be kept in memory.

	// (window as any)['fileLoader_' + combinedPartNumber] = loader;

	const response = await loader().then((it) =>
		wrapResultWithProgress(it, ({ loaded, total }) => {
			onProgress(total ? loaded / total : 0);
		}),
	);
	const data = await response.text();
	const context = new ParseRecordingFileContext();
	const events = parseRecordingFile(data, file.combinedPartNumber, context);
	return new ParsedRecording(events, context.unknownEvents, context.parsingErrors, file.combinedPartNumber);
}

export interface RunFileLoader {
	progress: () => number;
	done: () => boolean;
	abort: () => void;
	combinedRecording: () => CombinedRecording | null;
}

export function createRunFileLoader(files: RunFileInfo[]): RunFileLoader {
	if (isServer) {
		return {
			progress: () => 0,
			done: () => false,
			abort: () => {
				// do nothing
			},
			combinedRecording: () => null,
		};
	}

	console.log('started loading run files');

	const abortController = new AbortController();

	const cache = openRunfileCache();
	const fileLoaders = files.map((file) => {
		const [progress, setProgress] = createSignal(0);
		return {
			progress,
			promise: loadFile(cache, file, setProgress),
		};
	});
	const [combinedRecording, setCombinedRecording] = createSignal<CombinedRecording | null>(null);

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

	void Promise.all(fileLoaders.map((it) => it.promise)).then((recordings) => {
		if (abortController.signal.aborted) return;
		const combinedRecording = combineRecordings(recordings);
		storeInitializer.initializeFromRecording(combinedRecording);
		setCombinedRecording(combinedRecording);
		setDone(true);
	});

	onMount(() => {
		(window as any).recording = combinedRecording;
	});

	return {
		progress: deferredProgress,
		done,
		combinedRecording,
		abort: () => abortController.abort(),
	};
}
