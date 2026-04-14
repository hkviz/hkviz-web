import { batch, createContext, createEffect, onCleanup, useContext } from 'solid-js';
import { AnimationStore } from './animation-store';
import { ExtraChartStore } from './extra-chart-store';

const intervalMs = 1000 / 30;
// const intervalMs = 1000 / 60;

export function createAnimationTickStore(animationStore: AnimationStore, extraChartStore: ExtraChartStore) {
	const tickListeners = new Set<(deltaMs: number) => void>();

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
					listener(deltaMs);
				}
			});

			frameId = requestAnimationFrame(tick);
		}

		frameId = requestAnimationFrame(tick);

		onCleanup(() => cancelAnimationFrame(frameId));

		// onCleanup(() => clearInterval(interval));
	});

	function addTickListener(cb: (deltaMs: number) => void): () => void {
		tickListeners.add(cb);
		return () => tickListeners.delete(cb);
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
