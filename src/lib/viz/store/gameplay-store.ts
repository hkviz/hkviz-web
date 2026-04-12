import { createContext, createMemo, createSignal, useContext } from 'solid-js';
import { playerDataFieldsHollow } from '~/lib/game-data/hollow-data/player-data-hollow';
import { GameModuleOfGame } from '~/lib/game-module/game-module';
import { CombinedRecordingSilk } from '~/lib/parser/recording-files/parser-silk/recording-silk';
import { CombinedRecordingOfGame } from '~/lib/parser/recording-files/parser-specific/combined-recording';
import { GameId } from '~/lib/types/game-ids';

export function createGameplayStore<Game extends GameId>() {
	const [game, setGame] = createSignal<GameId | null>(null);
	const [gameModule, setGameModule] = createSignal<GameModuleOfGame<Game> | null>(null);
	const [recording, setRecording] = createSignal<CombinedRecordingOfGame<Game> | null>(null);

	function reset() {
		setRecording(null);
	}

	const timeFrame = createMemo(() => {
		const r = recording();
		if (!r || r.events.length === 0) return { min: 0, max: 0 } as const;

		return { min: r.events[0]!.msIntoGame, max: r.lastEvent().msIntoGame };
	});

	const isSteelSoul = createMemo(() => {
		const rec = recording();
		// TODO
		if (!rec || rec instanceof CombinedRecordingSilk) return false;
		const permaDeathValue = rec?.lastPlayerDataEventOfField(
			playerDataFieldsHollow.byFieldName.permadeathMode,
		)?.value;
		return permaDeathValue === 1 || permaDeathValue === 2;
	});

	return {
		recording,
		setRecording,
		timeFrame,
		isSteelSoul,
		reset,
		game,
		setGame,
		gameModule,
		setGameModule,
	};
}
export type GameplayStore<Game extends GameId = GameId> = ReturnType<typeof createGameplayStore<Game>>;
export const GameplayStoreContext = createContext<GameplayStore>();
export function useGameplayStore<Game extends GameId = GameId>() {
	const store = useContext(GameplayStoreContext);
	if (!store) throw new Error('useGameplayStore must be used within a GameplayStoreContext.Provider');
	return store as GameplayStore<Game>;
}
export function useGameplayStoreOptional<Game extends GameId = GameId>() {
	return (useContext(GameplayStoreContext) ?? null) as GameplayStore<Game> | null;
}
