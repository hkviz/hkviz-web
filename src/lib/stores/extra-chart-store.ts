import { batch, effect, signal } from '@preact/signals-react';
import { asReadonlySignal } from '../utils/signals';
import { animationStore } from './animation-store';
import { gameplayStore } from './gameplay-store';

const transitionDuration = 250;

const followsAnimation = signal(true);
const timeBounds = signal([0, 0] as readonly [number, number]);
const debouncedTimeBounds = signal([0, 0] as readonly [number, number]);

const debouncedMsIntoGame = signal(0);

function reset() {
    followsAnimation.value = true;
    timeBounds.value = [0, 0];
    debouncedTimeBounds.value = [0, 0];
    debouncedMsIntoGame.value = 0;
}

if (typeof window !== 'undefined') {
    setInterval(() => {
        batch(() => {
            debouncedMsIntoGame.value = animationStore.msIntoGame.value;
            debouncedTimeBounds.value = timeBounds.value;
        });
    }, transitionDuration);
}

function setTimeBounds(extraChartsTimeBounds: readonly [number, number]) {
    Object.freeze(extraChartsTimeBounds);
    const previous = timeBounds.value;
    if (previous[0] === extraChartsTimeBounds[0] && previous[1] === extraChartsTimeBounds[1]) return;
    timeBounds.value = extraChartsTimeBounds;
}

function resetTimeBounds() {
    setTimeBounds([gameplayStore.timeFrame.value.min, gameplayStore.timeFrame.value.max]);
}

function setTimeBoundsStopFollowIfOutside(extraChartsTimeBounds: readonly [number, number]) {
    setTimeBounds(extraChartsTimeBounds);
    const msIntoGame = animationStore.msIntoGame.value;
    if (followsAnimation.value && (msIntoGame < extraChartsTimeBounds[0] || msIntoGame > extraChartsTimeBounds[1])) {
        followsAnimation.value = false;
    }
}

function setTimeboundsForFollow() {
    const ms = animationStore.msIntoGame.peek();
    timeBounds.value = [ms - 17 * 60 * 1000, ms + 3 * 60 * 1000] as const;
}

function setFollowsAnimationAutoBounds(value: boolean) {
    followsAnimation.value = value;
    if (value) {
        setTimeboundsForFollow();
    } else {
        resetTimeBounds();
    }
}

export const extraChartStore = {
    debouncedMsIntoGame,
    debouncedTimeBounds,
    timeBounds: asReadonlySignal(timeBounds),
    transitionDuration,
    followsAnimation: asReadonlySignal(followsAnimation),
    setTimeBounds,
    resetTimeBounds,
    setTimeBoundsStopFollowIfOutside,
    setTimeboundsForFollow,
    setFollowsAnimationAutoBounds,
    reset,
};

const previousMsIntoGame = signal(0);
effect(() => {
    const newMsIntoGame = animationStore.msIntoGame.value;
    const timeFrame = gameplayStore.timeFrame.value;
    const _previousMsIntoGame = previousMsIntoGame.peek();

    if (followsAnimation.value) {
        const previousTimeBounds = timeBounds.peek();
        const diff = newMsIntoGame - _previousMsIntoGame;

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
        timeBounds.value = newBounds;
    }
    previousMsIntoGame.value = newMsIntoGame;
});
