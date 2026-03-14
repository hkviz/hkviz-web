import { createHotkey } from '@tanstack/solid-hotkeys';
import { batch, createContext, createEffect, createMemo, createSignal, untrack, useContext } from 'solid-js';
import { binarySearchLastIndexBefore, mainRoomDataBySceneName, type RoomData, type SceneEvent } from '../../parser';
import { GameplayStore } from './gameplay-store';
import { UiStore } from './ui-store';

export type MsIntoGameChangeType = 'smooth' | 'instant';
export type OnMsIntoGameChangeListener = (
	oldMsIntoGame: number,
	newMsIntoGame: number,
	changeType: MsIntoGameChangeType,
) => void;

export const PLAYBACK_SPEED_OPTIONS_VISIBLE = [250, 100, 75, 50, 25, 10];
export const PLAYBACK_SPEED_OPTIONS = [250, 100, 75, 50, 25, 10, 5, 2, 1, 0.5, 0.25, 0.1];
const PLAYBACK_SPEED_OPTIONS_REVERSED = [...PLAYBACK_SPEED_OPTIONS].reverse();
const PLAYBACK_SPEED_OPTION_MAX = Math.max(...PLAYBACK_SPEED_OPTIONS);
const PLAYBACK_SPEED_OPTION_MIN = Math.min(...PLAYBACK_SPEED_OPTIONS);

const MIN_PLAYBACK_SPEED = 0.1;
const MAX_PLAYBACK_SPEED = 64000;

export function createAnimationStore(gameplayStore: GameplayStore, uiStore: UiStore) {
	const [isPlaying, _setIsPlaying] = createSignal(false);
	const [msIntoGame, _setMsIntoGame] = createSignal(0);
	const [speedMultiplier, _setSpeedMultiplier] = createSignal(100);

	const onMsIntoGameChangeListeners = new Set<OnMsIntoGameChangeListener>();

	function setSpeedMultiplier(multiplier: number) {
		if (multiplier < MIN_PLAYBACK_SPEED) multiplier = MIN_PLAYBACK_SPEED;
		if (multiplier > MAX_PLAYBACK_SPEED) multiplier = MAX_PLAYBACK_SPEED;
		_setSpeedMultiplier(multiplier);
	}

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

	const mainMapSceneEventIndexes = createMemo(() => {
		const sceneEvents = gameplayStore.recording()?.sceneEvents;
		if (!sceneEvents) return null;

		const indexes: number[] = [];
		for (let i = 0; i < sceneEvents.length; i++) {
			if (mainRoomDataBySceneName.get(sceneEvents[i]!.sceneName)) {
				indexes.push(i);
			}
		}
		return indexes;
	});

	const currentSceneEventWithMainMapRoom = createMemo<{
		mainRoomData: RoomData | null;
		sceneEvent: SceneEvent | null;
	}>(() => {
		const recording = gameplayStore.recording();
		if (!recording) {
			return { mainRoomData: null, sceneEvent: null };
		}

		const indexes = mainMapSceneEventIndexes();
		if (!indexes || indexes.length === 0) {
			return { mainRoomData: null, sceneEvent: null };
		}

		const sceneEvents = recording.sceneEvents;
		const currentMs = msIntoGame();
		const indexInCandidates = binarySearchLastIndexBefore(
			indexes,
			currentMs,
			(sceneEventIndex) => sceneEvents[sceneEventIndex]!.msIntoGame,
		);

		if (indexInCandidates === -1) {
			return { mainRoomData: null, sceneEvent: null };
		}

		const sceneEventIndex = indexes[indexInCandidates]!;
		const sceneEvent = sceneEvents[sceneEventIndex] ?? null;
		const mainRoomData = sceneEvent ? (mainRoomDataBySceneName.get(sceneEvent.sceneName) ?? null) : null;

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

	function setLimitedAnimationMsIntoGame(newMsIntoGame: number, changeType: MsIntoGameChangeType) {
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

			const oldMsIntoGame = msIntoGame();
			_setMsIntoGame(newMsIntoGame);

			untrack(() => {
				onMsIntoGameChangeListeners.forEach((listener) => {
					try {
						listener(oldMsIntoGame, newMsIntoGame, changeType);
					} catch (e) {
						console.error('Error in onMsIntoGameChangeListener', e);
					}
				});
			});
			// TODO
			// recalcNextSplit();
		});
	}
	function setMsIntoGame(animationMsIntoGame: number, changeType: MsIntoGameChangeType) {
		setLimitedAnimationMsIntoGame(animationMsIntoGame, changeType);
	}
	function incrementMsIntoGame(increment: number, changeType: MsIntoGameChangeType) {
		setLimitedAnimationMsIntoGame(msIntoGame() + increment, changeType);
	}

	function setIsPlaying(playing: boolean) {
		if (playing && speedMultiplier() > 0 && msIntoGame() >= gameplayStore.timeFrame().max) {
			setMsIntoGame(gameplayStore.timeFrame().min, 'instant');
		}
		if (playing && speedMultiplier() < 0 && msIntoGame() <= gameplayStore.timeFrame().min) {
			setMsIntoGame(gameplayStore.timeFrame().max, 'instant');
		}

		_setIsPlaying(playing);
	}
	function togglePlaying() {
		setIsPlaying(!isPlaying());
	}

	function tick(deltaMs: number) {
		if (isPlaying()) {
			incrementMsIntoGame(deltaMs * speedMultiplier(), 'instant');
		}
	}

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

	function onMsIntoGameChange(listener: OnMsIntoGameChangeListener) {
		onMsIntoGameChangeListeners.add(listener);
		return () => onMsIntoGameChangeListeners.delete(listener);
	}

	function increasePlaybackSpeed() {
		const currentSpeed = speedMultiplier();
		const multiplied = currentSpeed * 2;
		if (multiplied < PLAYBACK_SPEED_OPTION_MIN) {
			setSpeedMultiplier(multiplied);
			return;
		}

		const nextSpeed = PLAYBACK_SPEED_OPTIONS_REVERSED.find((s) => s > currentSpeed) ?? multiplied;
		setSpeedMultiplier(nextSpeed);
	}

	function decreasePlaybackSpeed() {
		const currentSpeed = speedMultiplier();
		const multiplied = currentSpeed * 0.5;
		if (multiplied > PLAYBACK_SPEED_OPTION_MAX) {
			setSpeedMultiplier(multiplied);
			return;
		}

		const nextSpeed = PLAYBACK_SPEED_OPTIONS.find((s) => s < currentSpeed) ?? multiplied;
		setSpeedMultiplier(nextSpeed);
	}

	createHotkey({ key: 'L' }, () => {
		incrementMsIntoGame(1000, 'smooth');
	});

	createHotkey({ key: 'K' }, () => {
		togglePlaying();
	});

	createHotkey({ key: 'J' }, () => {
		incrementMsIntoGame(-1000, 'smooth');
	});

	createHotkey({ key: ',' }, () => {
		decreasePlaybackSpeed();
	});

	createHotkey({ key: '.' }, () => {
		increasePlaybackSpeed();
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
		onMsIntoGameChange,
		tick,
	};
}
export type AnimationStore = ReturnType<typeof createAnimationStore>;
export const AnimationStoreContext = createContext<AnimationStore>();
export function useAnimationStore() {
	const store = useContext(AnimationStoreContext);
	if (!store) throw new Error('useAnimationStore must be used within a AnimationStoreContext.Provider');
	return store;
}
