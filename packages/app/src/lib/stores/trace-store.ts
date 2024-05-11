import { assertNever } from '@hkviz/parser';
import { traceStore as traceStoreSolid } from '@hkviz/viz';
import { computed } from '@preact/signals-react';
import { animationStore } from './animation-store';

const msIntoGameForTraces = computed(() => {
    switch (traceStoreSolid.visibility.valuePreact) {
        // different for hide and all, so rendering still triggers when changing visibility
        case 'hide':
            return -2;
        case 'all':
            return -1;
        case 'animated':
            return animationStore.msIntoGame.valuePreact;
        default:
            assertNever(traceStoreSolid.visibility.valuePreact);
    }
});

export const traceStore = {
    ...traceStoreSolid,
    msIntoGameForTraces,
};
