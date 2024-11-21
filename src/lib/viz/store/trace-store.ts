import { assertNever } from '../../parser';
import { createMemo, createSignal } from 'solid-js';
import { animationStore } from './animation-store';

export type TraceVisibility = 'all' | 'animated' | 'hide';

const [visibility, setVisibility] = createSignal<TraceVisibility>('animated');

const [lengthMs, setLengthMs] = createSignal(1000 * 60 * 4);

function reset() {
	setVisibility('animated');
	setLengthMs(1000 * 60 * 4);
}

const msIntoGameForTraces = createMemo(() => {
	const _visibility = visibility();
	switch (_visibility) {
		// different for hide and all, so rendering still triggers when changing visibility
		case 'hide':
			return -2;
		case 'all':
			return -1;
		case 'animated':
			return animationStore.msIntoGame();
		default:
			assertNever(_visibility);
	}
});

export const traceStore = {
	visibility,
	setVisibility,
	msIntoGameForTraces,
	lengthMs,
	setLengthMs,
	reset,
};
