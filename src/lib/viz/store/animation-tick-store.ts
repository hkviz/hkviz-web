import { batch, createContext, createEffect, onCleanup, useContext } from 'solid-js';
import type { AnimationStore } from './animation-store';
import type { ExtraChartStore } from './extra-chart-store';

const intervalMs = 1000 / 30;
// const intervalMs = 1000 / 60;

export const TickListenerOrder = {
	AUTO_ZOOM: 1,
	TRACES_CANVAS: 2,
} as const;

type TickListenerEntry = {
	id: number;
	order: number;
	cb: (deltaMs: number) => void;
};

export function createAnimationTickStore(animationStore: AnimationStore, extraChartStore: ExtraChartStore) {
	const tickListeners: TickListenerEntry[] = [];
	let nextTickListenerId = 0;

	createEffect(() => {
		// const interval = setInterval(() => {
		// 	batch(() => {
		// 		animationStore.tick(intervalMs);
		// 		extraChartStore.tick(intervalMs);
		// 	});
		// }, intervalMs) as any;

		let previousNow: number | null = null;
		let frameId = 0;

		function tick(now: number) {
			const deltaMs = previousNow == null ? intervalMs : now - previousNow;
			previousNow = now;

			batch(() => {
				animationStore.tick(deltaMs);
				extraChartStore.tick(deltaMs);

				for (const listener of tickListeners) {
					listener.cb(deltaMs);
				}
			});

			frameId = requestAnimationFrame(tick);
		}

		frameId = requestAnimationFrame(tick);

		onCleanup(() => cancelAnimationFrame(frameId));

		// onCleanup(() => clearInterval(interval));
	});

	function addTickListener(cb: (deltaMs: number) => void, order: number = 0): () => void {
		const entry: TickListenerEntry = { id: nextTickListenerId++, order, cb };
		tickListeners.push(entry);
		tickListeners.sort((a, b) => (a.order === b.order ? a.id - b.id : a.order - b.order));

		return () => {
			const index = tickListeners.findIndex((it) => it.id === entry.id);
			if (index !== -1) {
				tickListeners.splice(index, 1);
			}
		};
	}

	return { addTickListener };
}
export type AnimationTickStore = ReturnType<typeof createAnimationTickStore>;
export const AnimationTickStoreContext = createContext<AnimationTickStore>();
export function useAnimationTickStore() {
	const store = useContext(AnimationTickStoreContext);
	if (!store) {
		throw new Error('useAnimationTickStore must be used within a AnimationTickStoreProvider');
	}
	return store;
}
