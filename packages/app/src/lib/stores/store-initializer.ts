import { type CombinedRecording } from '@hkviz/parser';
import { batch } from '@preact/signals-react';
import { useSearchParams, type ReadonlyURLSearchParams } from 'next/navigation';
import { useState } from 'react';
import { animationStore } from './animation-store';
import { extraChartStore } from './extra-chart-store';
import { gameplayStore } from './gameplay-store';
import { hoverMsStore } from './hover-ms-store';
import { mapZoomStore } from './map-zoom-store';
import { roomColoringStore } from './room-coloring-store';
import { roomDisplayStore } from './room-display-store';
import { splitsStore } from './splits-store';
import { traceStore } from './trace-store';
import { uiStore } from './ui-store';

function initializeStores(searchParams: ReadonlyURLSearchParams) {
    batch(() => {
        uiStore.displayVersion.value = searchParams.get('v') === '1' ? 'v1' : 'vnext';
        gameplayStore.reset();
        uiStore.reset();
        animationStore.reset();
        extraChartStore.reset();
        hoverMsStore.reset();
        roomColoringStore.reset();
        roomDisplayStore.reset();
        splitsStore.reset();
        traceStore.reset();
        mapZoomStore.reset();
    });
}

export function useStoreInitializer() {
    const searchParams = useSearchParams();
    useState(() => initializeStores(searchParams));
}

export function initializeFromRecording(recording: CombinedRecording | null) {
    gameplayStore.recording.value = recording;
    animationStore.setMsIntoGame(gameplayStore.timeFrame.value.max);
    extraChartStore.setTimeboundsForFollow();
}

export const storeInitializer = {
    initializeFromRecording,
};
