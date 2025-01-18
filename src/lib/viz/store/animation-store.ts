import { mainRoomDataBySceneName, type RoomData, type SceneEvent } from '../../parser';
import { batch, createContext, createEffect, createMemo, createSignal, onCleanup, untrack, useContext } from 'solid-js';
import { GameplayStore } from './gameplay-store';
import { UiStore } from './ui-store';

const intervalMs = 1000 / 30;
// const intervalMs = 1000 / 60;

export function createAnimationStore(gameplayStore: GameplayStore, uiStore: UiStore) {
	const [isPlaying, _setIsPlaying] = createSignal(false);
	const [msIntoGame, _setMsIntoGame] = createSignal(0);
	const [speedMultiplier, setSpeedMultiplier] = createSignal(100);

	function reset() {
		_setIsPlaying(false);
		_setMsIntoGame(0);
		setSpeedMultiplier(100);
	}

	const currentSceneEventIndex = createMemo(() => {
		return gameplayStore.recording()?.sceneEventIndexFromMs(msIntoGame()) ?? null;
	});
	const currentSceneEvent = createMemo(() => {
		const r = gameplayStore.recording();
		if (!r) return null;
		const index = currentSceneEventIndex();
		if (index === null) return null;

		return r.sceneEvents[index] ?? null;
	});

	const currentSceneEventWithMainMapRoom = createMemo<{
		mainRoomData: RoomData | null;
		sceneEvent: SceneEvent | null;
	}>(() => {
		let sceneEvent = currentSceneEvent();
		let mainRoomData: RoomData | null = null;
		do {
			if (!sceneEvent) break;
			mainRoomData = mainRoomDataBySceneName.get(sceneEvent.sceneName) ?? null;
			sceneEvent = sceneEvent.previousSceneEvent;
		} while (!mainRoomData && !!sceneEvent);
		return { mainRoomData, sceneEvent };
	});

	const currentFrameEndEventIndex = createMemo(() => {
		return gameplayStore.recording()?.frameEndEventIndexFromMs(msIntoGame()) ?? null;
	});
	const currentFrameEndEvent = createMemo(() => {
		const r = gameplayStore.recording();
		if (!r) return null;
		const index = currentFrameEndEventIndex();
		if (index === null) return null;

		return r.frameEndEvents[index] ?? null;
	});

	function setLimitedAnimationMsIntoGame(newMsIntoGame: number) {
		batch(() => {
			const timeFrame = gameplayStore.timeFrame();
			if (Number.isNaN(newMsIntoGame) || typeof newMsIntoGame != 'number') return;

			if (newMsIntoGame > timeFrame.max) {
				newMsIntoGame = timeFrame.max;
				setIsPlaying(false);
			} else if (newMsIntoGame < timeFrame.min) {
				newMsIntoGame = timeFrame.min;
				setIsPlaying(false);
			}

			_setMsIntoGame(newMsIntoGame);
			// TODO
			// recalcNextSplit();
		});
	}
	function setMsIntoGame(animationMsIntoGame: number) {
		setLimitedAnimationMsIntoGame(animationMsIntoGame);
	}
	function incrementMsIntoGame(increment: number) {
		setLimitedAnimationMsIntoGame(msIntoGame() + increment);
	}

	function setIsPlaying(playing: boolean) {
		if (playing && speedMultiplier() > 0 && msIntoGame() >= gameplayStore.timeFrame().max) {
			setMsIntoGame(gameplayStore.timeFrame().min);
		}
		if (playing && speedMultiplier() < 0 && msIntoGame() <= gameplayStore.timeFrame().min) {
			setMsIntoGame(gameplayStore.timeFrame().max);
		}

		_setIsPlaying(playing);
	}
	function togglePlaying() {
		setIsPlaying(!isPlaying());
	}

	// TODO move to solid
	createEffect(() => {
		if (!isPlaying()) return;

		const interval = setInterval(() => {
			untrack(() => {
				incrementMsIntoGame(intervalMs * speedMultiplier());
			});
		}, intervalMs) as any;

		onCleanup(() => clearInterval(interval));
	});

	// change tabs when animation starts
	createEffect(() => {
		if (isPlaying()) {
			untrack(() => {
				if (uiStore.mainCardTab() === 'overview') {
					uiStore.activateTab('map');
				}
			});
		}
	});

	return {
		isPlaying,
		msIntoGame,
		speedMultiplier,
		currentSceneEventIndex,
		currentSceneEvent,
		currentFrameEndEventIndex,
		currentFrameEndEvent,
		setMsIntoGame,
		incrementMsIntoGame,
		setIsPlaying,
		togglePlaying,
		reset,
		currentSceneEventWithMainMapRoom,
		setSpeedMultiplier,
	};
}
export type AnimationStore = ReturnType<typeof createAnimationStore>;
export const AnimationStoreContext = createContext<AnimationStore>();
export function useAnimationStore() {
	const store = useContext(AnimationStoreContext);
	if (!store) throw new Error('useAnimationStore must be used within a AnimationStoreContext.Provider');
	return store;
}
