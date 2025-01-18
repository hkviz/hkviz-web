import { assertNever } from '../../parser';
import { createContext, createMemo, createSignal, useContext } from 'solid-js';
import { AnimationStore } from './animation-store';

export type TraceVisibility = 'all' | 'animated' | 'hide';

export function createTraceStore(animationStore: AnimationStore) {
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

	return {
		visibility,
		setVisibility,
		msIntoGameForTraces,
		lengthMs,
		setLengthMs,
		reset,
	};
}
export type TraceStore = ReturnType<typeof createTraceStore>;
export const TraceStoreContext = createContext<TraceStore>();
export function useTraceStore() {
	const store = useContext(TraceStoreContext);
	if (!store) throw new Error('useTraceStore must be used within a TraceStoreContext.Provider');
	return store;
}
