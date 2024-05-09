import { createMemo, batch, createEffect, untrack, onCleanup } from 'solid-js';
import { type RoomData, mainRoomDataBySceneName, type SceneEvent } from '@hkviz/parser';
import { gameplayStore } from './gameplay-store';
import { createSignal } from '../preact-solid-combat';

const intervalMs = 1000 / 30;
// const intervalMs = 1000 / 60;

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

const currentSceneEventWithMainMapRoom = createMemo<{ mainRoomData: RoomData | null; sceneEvent: SceneEvent | null }>(
    () => {
        let sceneEvent = currentSceneEvent();
        let mainRoomData: RoomData | null = null;
        do {
            if (!sceneEvent) break;
            mainRoomData = mainRoomDataBySceneName.get(sceneEvent.sceneName) ?? null;
            sceneEvent = sceneEvent.previousSceneEvent;
        } while (!mainRoomData && !!sceneEvent);
        return { mainRoomData, sceneEvent };
    },
);

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

export const animationStore = {
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

// TODO move to solid
createEffect(() => {
    if (!isPlaying()) return;

    const interval = setInterval(() => {
        untrack(() => {
            animationStore.incrementMsIntoGame(intervalMs * speedMultiplier());
        });
    }, intervalMs);

    onCleanup(() => clearInterval(interval));
});
