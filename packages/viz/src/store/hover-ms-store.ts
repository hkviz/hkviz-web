import { createSignal } from '../preact-solid-combat';

const [hoveredMsIntoGame, setHoveredMsIntoGame] = createSignal<number | null>(null);

function reset() {
    setHoveredMsIntoGame(null);
}

function unsetHoveredMsIntoGame(ms: number | null) {
    if (hoveredMsIntoGame() === ms) {
        setHoveredMsIntoGame(null);
    }
}

export const hoverMsStore = {
    hoveredMsIntoGame,
    setHoveredMsIntoGame,
    unsetHoveredMsIntoGame,
    reset,
};
