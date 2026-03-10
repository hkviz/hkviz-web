import { batch, createContext, createSignal, onCleanup, untrack, useContext } from 'solid-js';
import { AnimationStore } from './animation-store';
import { GameplayStore } from './gameplay-store';

const transitionDuration = 50;

export function createExtraChartStore(animationStore: AnimationStore, gameplayStore: GameplayStore) {
	const [followsAnimation, setFollowsAnimation] = createSignal(true);
	const [timeBounds, _setTimeBounds] = createSignal([0, 0] as readonly [number, number]);

	// debounced is deprecated - should be removed
	const [debouncedTimeBounds, setDebouncedTimeBounds] = createSignal([0, 0] as readonly [number, number]);
	const [debouncedMsIntoGame, setDebouncedMsIntoGame] = createSignal(0);

	const [timeBoundsTransition, _setTimeBoundsTransition] = createSignal([0, 0] as readonly [number, number]);

	function reset() {
		setFollowsAnimation(true);
		_setTimeBounds([0, 0]);
		setDebouncedTimeBounds([0, 0]);
		setTimeBoundsTransition([0, 0]);
		setDebouncedMsIntoGame(0);
	}

	// todo remove interval
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

	function setTimeBoundsTransition(extraChartsTimeBounds: readonly [number, number]) {
		Object.freeze(extraChartsTimeBounds);
		const previous = timeBoundsTransition();
		if (previous[0] === extraChartsTimeBounds[0] && previous[1] === extraChartsTimeBounds[1]) return;
		_setTimeBoundsTransition(extraChartsTimeBounds);
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

	function moveTimeBoundsByDeltaMsIntoGame(
		previousTimeBounds: readonly [number, number],
		deltaMs: number,
	): readonly [number, number] {
		const timeFrame = gameplayStore.timeFrame();
		const newBounds = [previousTimeBounds[0] + deltaMs, previousTimeBounds[1] + deltaMs] as [number, number];
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
		return newBounds;
	}

	const removeAnimationStoreListener = animationStore.onMsIntoGameChange(
		(oldMsIntoGame, newMsIntoGame, changeType) => {
			untrack(() => {
				if (followsAnimation()) {
					const deltaMs = newMsIntoGame - oldMsIntoGame;
					setTimeBounds(moveTimeBoundsByDeltaMsIntoGame(timeBounds(), deltaMs));
					if (changeType === 'instant') {
						setTimeBoundsTransition(moveTimeBoundsByDeltaMsIntoGame(timeBoundsTransition(), deltaMs));
					}
				}
				//previousMsIntoGame = newMsIntoGame;
			});
		},
	);

	onCleanup(() => {
		removeAnimationStoreListener();
	});

	function tick(deltaMs: number) {
		const target = timeBounds();
		const current = timeBoundsTransition();
		if (current[0] === target[0] && current[1] === target[1]) return;

		const alpha = Math.max(0, Math.min(1, deltaMs / transitionDuration));
		const epsilonMs = 0.5;

		function moveTowards(currentValue: number, targetValue: number) {
			if (currentValue === targetValue) return targetValue;
			const nextValue = currentValue + (targetValue - currentValue) * alpha;
			if (!Number.isFinite(nextValue)) return targetValue;

			const didNotMove = nextValue === currentValue;
			const overshot =
				(targetValue > currentValue && nextValue > targetValue) ||
				(targetValue < currentValue && nextValue < targetValue);

			if (didNotMove || overshot || Math.abs(targetValue - nextValue) <= epsilonMs) {
				return targetValue;
			}

			return nextValue;
		}

		setTimeBoundsTransition([moveTowards(current[0], target[0]), moveTowards(current[1], target[1])] as const);
	}

	return {
		debouncedMsIntoGame,
		debouncedTimeBounds,
		timeBounds,
		timeBoundsTransition,
		transitionDuration,
		followsAnimation,
		setTimeBounds,
		resetTimeBounds,
		setTimeBoundsStopFollowIfOutside,
		setTimeboundsForFollow,
		setFollowsAnimationAutoBounds,
		reset,
		tick,
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
