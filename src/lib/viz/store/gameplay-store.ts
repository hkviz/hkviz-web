import { createContext, createEffect, createMemo, createSignal, onCleanup, onMount, useContext } from 'solid-js';
import type { GameModuleOfGame } from '~/lib/game-module/game-module';
import { isCombinedRecordingSilk } from '~/lib/parser/recording-files/parser-silk/recording-check-silk';
import type { CombinedRecordingOfGame } from '~/lib/parser/recording-files/parser-specific/combined-recording';
import type { GameId } from '~/lib/types/game-ids';
import { Timeframe } from './timeframe';

export function createGameplayStore<Game extends GameId>() {
	const [game, setGame] = createSignal<GameId | null>(null);
	const [gameModule, setGameModule] = createSignal<GameModuleOfGame<Game> | null>(null);
	const [recording, setRecording] = createSignal<CombinedRecordingOfGame<Game> | null>(null);

	const [includePreRecordingEvents, setIncludePreRecordingEvents] = createSignal(true);

	function reset() {
		setRecording(null);
	}

	onMount(() => {
		onCleanup(() => {});
	});

	createEffect(() => {
		const r = recording();
		(window as any).recording = r;
		onCleanup(() => {
			if ((window as any).recording === r) {
				(window as any).recording = null;
			}
		});
	});

	const hasPreRecordingEvents = createMemo(() => {
		const r = recording();
		if (!r || r.events.length === 0) return false;
		return r.events[0]!.msIntoGame < 0;
	});

	const timeFrameAll = createMemo(() => {
		const r = recording();
		if (!r || r.events.length === 0) {
			return new Timeframe(0, 0);
		}

		const min = r.events[0]!.msIntoGame;
		const max = r.lastEvent().msIntoGame;

		return new Timeframe(min, max);
	});

	const timeFrameRecorded = createMemo(() => {
		const max = timeFrameAll().max;
		return new Timeframe(0, max);
	});

	const timeFrameDisplay = createMemo(() => {
		if (includePreRecordingEvents()) {
			return timeFrameAll();
		} else {
			return timeFrameRecorded();
		}
	});

	const eventsDisplay = createMemo(() => {
		const r = recording();
		if (!r) return [];
		if (includePreRecordingEvents()) return r.events;
		return r.events.filter((e) => e.msIntoGame >= 0);
	});

	const isSteelSoul = createMemo(() => {
		const rec = recording();
		// TODO
		if (!rec || isCombinedRecordingSilk(rec)) return false;
		const permaDeathValue = rec?.lastPlayerDataEventOfField('permadeathMode')?.value;
		return permaDeathValue === 1 || permaDeathValue === 2;
	});

	return {
		recording,
		setRecording,
		timeFrameDisplay,
		includePreRecordingEvents,
		setIncludePreRecordingEvents,
		isSteelSoul,
		reset,
		game,
		setGame,
		gameModule,
		setGameModule,
		eventsDisplay,
		hasPreRecordingEvents,
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
