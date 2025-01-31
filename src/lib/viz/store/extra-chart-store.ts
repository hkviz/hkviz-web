import { batch, createContext, createEffect, createSignal, untrack, useContext } from 'solid-js';
import { AnimationStore } from './animation-store';
import { GameplayStore } from './gameplay-store';

const transitionDuration = 250;

export function createExtraChartStore(animationStore: AnimationStore, gameplayStore: GameplayStore) {
	const [followsAnimation, setFollowsAnimation] = createSignal(true);
	const [timeBounds, _setTimeBounds] = createSignal([0, 0] as readonly [number, number]);
	const [debouncedTimeBounds, setDebouncedTimeBounds] = createSignal([0, 0] as readonly [number, number]);

	const [debouncedMsIntoGame, setDebouncedMsIntoGame] = createSignal(0);

	function reset() {
		setFollowsAnimation(true);
		_setTimeBounds([0, 0]);
		setDebouncedTimeBounds([0, 0]);
		setDebouncedMsIntoGame(0);
	}

	if (typeof window !== 'undefined') {
		setInterval(() => {
			batch(() => {
				setDebouncedMsIntoGame(animationStore.msIntoGame());
				setDebouncedTimeBounds(timeBounds());
			});
		}, transitionDuration);
	}

	function setTimeBounds(extraChartsTimeBounds: readonly [number, number]) {
		Object.freeze(extraChartsTimeBounds);
		const previous = timeBounds();
		if (previous[0] === extraChartsTimeBounds[0] && previous[1] === extraChartsTimeBounds[1]) return;
		_setTimeBounds(extraChartsTimeBounds);
	}

	function resetTimeBounds() {
		setTimeBounds([gameplayStore.timeFrame().min, gameplayStore.timeFrame().max]);
	}

	function setTimeBoundsStopFollowIfOutside(extraChartsTimeBounds: readonly [number, number]) {
		setTimeBounds(extraChartsTimeBounds);
		const msIntoGame = animationStore.msIntoGame();
		if (followsAnimation() && (msIntoGame < extraChartsTimeBounds[0] || msIntoGame > extraChartsTimeBounds[1])) {
			setFollowsAnimation(false);
		}
	}

	function setTimeboundsForFollow() {
		untrack(() => {
			const ms = animationStore.msIntoGame();
			_setTimeBounds([ms - 17 * 60 * 1000, ms + 3 * 60 * 1000]);
		});
	}

	function setFollowsAnimationAutoBounds(value: boolean) {
		setFollowsAnimation(value);
		if (value) {
			setTimeboundsForFollow();
		} else {
			resetTimeBounds();
		}
	}

	let previousMsIntoGame = 0;
	createEffect(() => {
		const newMsIntoGame = animationStore.msIntoGame();
		const timeFrame = gameplayStore.timeFrame();

		untrack(() => {
			if (followsAnimation()) {
				const previousTimeBounds = timeBounds();
				const diff = newMsIntoGame - previousMsIntoGame;

				const newBounds = [previousTimeBounds[0] + diff, previousTimeBounds[1] + diff] as [number, number];
				if (previousTimeBounds[1] - previousTimeBounds[0] >= timeFrame.max * 0.8) {
					// bounds are limited if the bounds make up a large part of the original chart.
					// otherwise it can go outside, so the line stays at the same position.
					if (newBounds[0] < timeFrame.min) {
						const diff = timeFrame.min - newBounds[0];
						newBounds[0] += diff;
						newBounds[1] += diff;
					}
					if (newBounds[1] > timeFrame.max) {
						const diff = timeFrame.max - newBounds[1];
						newBounds[0] += diff;
						newBounds[1] += diff;
					}
				}
				setTimeBounds(newBounds);
			}
			previousMsIntoGame = newMsIntoGame;
		});
	});

	return {
		debouncedMsIntoGame,
		debouncedTimeBounds,
		timeBounds,
		transitionDuration,
		followsAnimation,
		setTimeBounds,
		resetTimeBounds,
		setTimeBoundsStopFollowIfOutside,
		setTimeboundsForFollow,
		setFollowsAnimationAutoBounds,
		reset,
	};
}
export type ExtraChartStore = ReturnType<typeof createExtraChartStore>;
export const ExtraChartStoreContext = createContext<ExtraChartStore>();
export function useExtraChartStore() {
	const store = useContext(ExtraChartStoreContext);
	if (!store) {
		throw new Error('useExtraChartStore must be used within a ExtraChartStoreProvider');
	}
	return store;
}
