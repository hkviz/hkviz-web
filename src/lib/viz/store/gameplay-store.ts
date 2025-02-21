import { createContext, createEffect, createMemo, createSignal, useContext } from 'solid-js';
import { playerDataFields, type CombinedRecording } from '../../parser';

export function createGameplayStore() {
	const [recording, setRecording] = createSignal<CombinedRecording | null>(null);

	function reset() {
		setRecording(null);
	}

	const timeFrame = createMemo(() => {
		const r = recording();
		if (!r || r.events.length === 0) return { min: 0, max: 0 } as const;

		return { min: r.events[0]!.msIntoGame, max: r.lastEvent().msIntoGame };
	});

	const isSteelSoul = createMemo(() => {
		const permaDeathValue = recording()?.lastPlayerDataEventOfField(
			playerDataFields.byFieldName.permadeathMode,
		)?.value;
		return permaDeathValue === 1 || permaDeathValue === 2;
	});
	createEffect(() => {
		console.log('tf', timeFrame());
	});

	return {
		recording,
		setRecording,
		timeFrame,
		isSteelSoul,
		reset,
	};
}
export type GameplayStore = ReturnType<typeof createGameplayStore>;
export const GameplayStoreContext = createContext<GameplayStore>();
export function useGameplayStore() {
	const store = useContext(GameplayStoreContext);
	if (!store) throw new Error('useGameplayStore must be used within a GameplayStoreContext.Provider');
	return store;
}
export function useGameplayStoreOptional() {
	return useContext(GameplayStoreContext);
}
