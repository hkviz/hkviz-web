import { batch, signal } from '@preact/signals-react';
import { animationStore } from './animation-store';

const transitionDuration = 250;

const timeBounds = signal([0, 0] as readonly [number, number]);
const debouncedTimeBounds = signal([0, 0] as readonly [number, number]);

const debouncedMsIntoGame = signal(0);

setInterval(() => {
    batch(() => {
        debouncedMsIntoGame.value = animationStore.msIntoGame.value;
        debouncedTimeBounds.value = timeBounds.value;
    });
}, transitionDuration);

export const extraChartStore = {
    debouncedShownMsIntoGame: debouncedMsIntoGame,
    debouncedTimeBounds,
    timeBounds,
    transitionDuration,
};
