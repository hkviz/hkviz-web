import { createContext, createMemo, createSignal, useContext } from 'solid-js';
import { GameplayStore } from './gameplay-store';

export function createHoverMsStore(gameplayStore: GameplayStore) {
	const [hoveredMsIntoGame, setHoveredMsIntoGame] = createSignal<number | null>(null);

	function reset() {
		setHoveredMsIntoGame(null);
	}

	function unsetHoveredMsIntoGame(ms: number | null) {
		if (hoveredMsIntoGame() === ms) {
			setHoveredMsIntoGame(null);
		}
	}

	const hoveredFrameEndEventIndex = createMemo(() => {
		const _hoveredMsIntoGame = hoveredMsIntoGame();
		if (_hoveredMsIntoGame === null) return null;
		return gameplayStore.recording()?.frameEndEventIndexFromMs(_hoveredMsIntoGame) ?? null;
	});
	const hoveredFrameEndEvent = createMemo(() => {
		const r = gameplayStore.recording();
		if (!r) return null;
		const index = hoveredFrameEndEventIndex();
		if (index === null) return null;

		return r.frameEndEvents[index] ?? null;
	});

	return {
		hoveredMsIntoGame,
		setHoveredMsIntoGame,
		unsetHoveredMsIntoGame,
		hoveredFrameEndEventIndex,
		hoveredFrameEndEvent,
		reset,
	};
}
export type HoverMsStore = ReturnType<typeof createHoverMsStore>;
export const HoverMsStoreContext = createContext<HoverMsStore>();
export function useHoverMsStore() {
	const store = useContext(HoverMsStoreContext);
	if (!store) throw new Error('useHoverMsStore must be used within a HoverMsStoreContext.Provider');
	return store;
}
