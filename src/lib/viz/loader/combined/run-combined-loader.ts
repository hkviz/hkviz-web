/**
 * Combines the data from runfiles stored in buckets with the live data retrieved from the websocket.
 */

import { GetRunResult } from '~/server/run/run-get';
import { createRunFileLoader } from '../parts/run-files-loader';
import { createMemo } from 'solid-js';
import { createRunLiveLoader } from '../live/run-live-loader';

export function createCombinedRunLoader(runData: () => GetRunResult | undefined) {
	const loader = createMemo(() => {
		const run = runData();
		if (!run) return null;
		return createRunFileLoader(run.files);
	});

	const liveLoader = createRunLiveLoader(() => loader()?.combinedRecording() ?? null);

	return { loader, liveLoader };
}
