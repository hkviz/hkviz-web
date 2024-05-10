import { aggregateRecording, aggregationStore as aggregationStoreSolid } from '@hkviz/viz';
import { computed } from '@preact/signals-react';
import { gameplayStore } from './gameplay-store';

const aggregations = computed(() => {
    const recording = gameplayStore.recording.valuePreact;
    if (!recording) return null;
    return aggregateRecording(recording);
});

export const aggregationStore = {
    ...aggregationStoreSolid,
    data: aggregations,
};
