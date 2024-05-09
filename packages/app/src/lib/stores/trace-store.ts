import { assertNever } from '@hkviz/parser';
import { computed, signal } from '@preact/signals-react';
import { animationStore } from './animation-store';

export type TraceVisibility = 'all' | 'animated' | 'hide';

const visibility = signal<TraceVisibility>('animated');

const lengthMs = signal(1000 * 60 * 4);

function reset() {
    visibility.value = 'animated';
    lengthMs.value = 1000 * 60 * 4;
}

const msIntoGameForTraces = computed(() => {
    switch (visibility.value) {
        // different for hide and all, so rendering still triggers when changing visibility
        case 'hide':
            return -2;
        case 'all':
            return -1;
        case 'animated':
            return animationStore.msIntoGame.valuePreact;
        default:
            assertNever(visibility.value);
    }
});

export const traceStore = {
    visibility,
    msIntoGameForTraces,
    lengthMs,
    reset,
};
