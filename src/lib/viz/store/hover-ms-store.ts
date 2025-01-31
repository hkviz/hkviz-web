import { createContext, createSignal, useContext } from 'solid-js';

export function createHoverMsStore() {
	const [hoveredMsIntoGame, setHoveredMsIntoGame] = createSignal<number | null>(null);

	function reset() {
		setHoveredMsIntoGame(null);
	}

	function unsetHoveredMsIntoGame(ms: number | null) {
		if (hoveredMsIntoGame() === ms) {
			setHoveredMsIntoGame(null);
		}
	}

	return {
		hoveredMsIntoGame,
		setHoveredMsIntoGame,
		unsetHoveredMsIntoGame,
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
