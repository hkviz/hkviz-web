import { batch, createContext, createEffect, onCleanup, useContext } from 'solid-js';
import { AnimationStore } from './animation-store';
import { ExtraChartStore } from './extra-chart-store';

const intervalMs = 1000 / 60;
// const intervalMs = 1000 / 60;

export function createAnimationTickStore(animationStore: AnimationStore, extraChartStore: ExtraChartStore) {
	createEffect(() => {
		const interval = setInterval(() => {
			batch(() => {
				animationStore.tick(intervalMs);
				extraChartStore.tick(intervalMs);
			});
		}, intervalMs) as any;

		onCleanup(() => clearInterval(interval));
	});

	return {};
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
