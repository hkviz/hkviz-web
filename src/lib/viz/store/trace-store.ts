import { createContext, createMemo, createSignal, useContext } from 'solid-js';
import { assertNever } from '../../parser';
import { AnimationStore } from './animation-store';

export type TraceVisibility = 'stay' | 'fade_out' | 'hide';

export const TRACE_VISIBILITIES: TraceVisibility[] = ['fade_out', 'stay', 'hide'];

const DEFAULT_TRACE_LENGTH_MS = 1000 * 60 * 5;

export function createTraceStore(animationStore: AnimationStore) {
	const [visibility, setVisibility] = createSignal<TraceVisibility>('fade_out');

	const [lengthMs, setLengthMs] = createSignal(DEFAULT_TRACE_LENGTH_MS);

	const lengthMin = () => lengthMs() / (1000 * 60);
	const setLengthMin = (min: number) => setLengthMs(Math.min(min, 999) * 1000 * 60);

	function reset() {
		setVisibility('fade_out');
		setLengthMs(DEFAULT_TRACE_LENGTH_MS);
	}

	const msIntoGameForTraces = createMemo(() => {
		const _visibility = visibility();
		switch (_visibility) {
			// different for hide and all, so rendering still triggers when changing visibility
			case 'hide':
				return -1;
			case 'stay':
			case 'fade_out':
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
		lengthMin,
		setLengthMin,
	};
}
export type TraceStore = ReturnType<typeof createTraceStore>;
export const TraceStoreContext = createContext<TraceStore>();
export function useTraceStore() {
	const store = useContext(TraceStoreContext);
	if (!store) throw new Error('useTraceStore must be used within a TraceStoreContext.Provider');
	return store;
}
