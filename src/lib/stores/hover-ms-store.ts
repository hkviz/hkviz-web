import { signal } from '@preact/signals-react';
import { asReadonlySignal } from '../utils/signals';

const hoveredMsIntoGame = signal<number | null>(null);

function reset() {
    hoveredMsIntoGame.value = null;
}

function setHoveredMsIntoGame(ms: number | null) {
    hoveredMsIntoGame.value = ms;
}
function unsetHoveredMsIntoGame(ms: number | null) {
    if (hoveredMsIntoGame.value === ms) {
        setHoveredMsIntoGame(null);
    }
}

export const hoverMsStore = {
    hoveredMsIntoGame: asReadonlySignal(hoveredMsIntoGame),
    setHoveredMsIntoGame,
    unsetHoveredMsIntoGame,
    reset,
};
