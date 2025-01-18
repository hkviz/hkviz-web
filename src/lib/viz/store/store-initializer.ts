import { batch } from 'solid-js';
import { type CombinedRecording } from '../../parser';
import { animationStore } from './animation-store';
import { extraChartStore } from './extra-chart-store';
import { gameplayStore } from './gameplay-store';
import { hoverMsStore } from './hover-ms-store';
import { mapZoomStore } from './map-zoom-store';
import { roomDisplayStore } from './room-display-store';
import { splitsStore } from './splits-store';
import { traceStore } from './trace-store';
import { type DisplayVersion, uiStore } from './ui-store';

function initializeStores(displayVersion: DisplayVersion) {
	batch(() => {
		uiStore.setDisplayVersion(displayVersion);
		gameplayStore.reset();
		uiStore.reset();
		animationStore.reset();
		extraChartStore.reset();
		hoverMsStore.reset();
		roomDisplayStore.reset();
		splitsStore.reset();
		traceStore.reset();
		mapZoomStore.reset();
	});
}

export function initializeFromRecording(recording: CombinedRecording | null) {
	gameplayStore.setRecording(recording);
	animationStore.setMsIntoGame(gameplayStore.timeFrame().max);
	extraChartStore.setTimeboundsForFollow();
}

export const storeInitializer = {
	initializeStores,
	initializeFromRecording,
};
