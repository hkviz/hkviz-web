import { batch, computed, effect, signal } from '@preact/signals-react';
import { asReadonlySignal } from '~/lib/utils/signals';
import { RoomData, mainRoomDataBySceneName } from '../viz/map-data/rooms';
import { gameplayStore } from './gameplay-store';

const intervalMs = 1000 / 30;
// const intervalMs = 1000 / 60;

const isPlaying = signal(false);
const msIntoGame = signal(0);
const speedMultiplier = signal(100);

function reset() {
    isPlaying.value = false;
    msIntoGame.value = 0;
    speedMultiplier.value = 100;
}

const currentSceneEventIndex = computed(() => {
    return gameplayStore.recording.value?.sceneEventIndexFromMs(msIntoGame.value) ?? null;
});
const currentSceneEvent = computed(() => {
    const r = gameplayStore.recording.value;
    if (!r) return null;
    const index = currentSceneEventIndex.value;
    if (index === null) return null;

    return r.sceneEvents[index] ?? null;
});

const currentSceneEventWithMainMapRoom = computed(() => {
    let sceneEvent = currentSceneEvent.value;
    let mainRoomData: RoomData | undefined = undefined;
    do {
        if (!sceneEvent) break;
        mainRoomData = mainRoomDataBySceneName.get(sceneEvent.sceneName);
        sceneEvent = sceneEvent.previousSceneEvent;
    } while (!mainRoomData && !!sceneEvent);
    return { mainRoomData, sceneEvent };
});

const currentFrameEndEventIndex = computed(() => {
    return gameplayStore.recording.value?.frameEndEventIndexFromMs(msIntoGame.value) ?? null;
});
const currentFrameEndEvent = computed(() => {
    const r = gameplayStore.recording.value;
    if (!r) return null;
    const index = currentFrameEndEventIndex.value;
    if (index === null) return null;

    return r.frameEndEvents[index] ?? null;
});

function setLimitedAnimationMsIntoGame(newMsIntoGame: number) {
    batch(() => {
        const previousMsIntoGame = msIntoGame.value;
        const timeFrame = gameplayStore.timeFrame.value;
        if (Number.isNaN(newMsIntoGame) || typeof newMsIntoGame != 'number') return;

        if (newMsIntoGame > timeFrame.max) {
            newMsIntoGame = timeFrame.max;
            isPlaying.value = false;
        } else if (newMsIntoGame < timeFrame.min) {
            newMsIntoGame = timeFrame.min;
            isPlaying.value = false;
        }

        msIntoGame.value = newMsIntoGame;
        // TODO
        // recalcNextSplit();
    });
}
function setMsIntoGame(animationMsIntoGame: number) {
    setLimitedAnimationMsIntoGame(animationMsIntoGame);
}
function incrementMsIntoGame(increment: number) {
    setLimitedAnimationMsIntoGame(msIntoGame.value + increment);
}

function setIsPlaying(playing: boolean) {
    if (playing && speedMultiplier.value > 0 && msIntoGame.value >= gameplayStore.timeFrame.value.max) {
        setMsIntoGame(gameplayStore.timeFrame.value.min);
    }
    if (playing && speedMultiplier.value < 0 && msIntoGame.value <= gameplayStore.timeFrame.value.min) {
        setMsIntoGame(gameplayStore.timeFrame.value.max);
    }

    isPlaying.value = playing;
}
function togglePlaying() {
    setIsPlaying(!isPlaying.value);
}

export const animationStore = {
    isPlaying: asReadonlySignal(isPlaying),
    msIntoGame: asReadonlySignal(msIntoGame),
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
};

effect(() => {
    if (!isPlaying.value) return;

    const interval = setInterval(() => {
        animationStore.incrementMsIntoGame(intervalMs * speedMultiplier.peek());
    }, intervalMs);

    return () => clearInterval(interval);
});
