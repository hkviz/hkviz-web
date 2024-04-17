import { computed, signal } from '@preact/signals-react';
import { gameplayStore } from './gameplay-store';

export const msIntoGame = signal(0);

export const currentSceneEventIndex = computed(() => {
    return gameplayStore.recording.value?.sceneEventIndexFromMs(msIntoGame.value) ?? null;
});
export const currentSceneEvent = computed(() => {
    const r = gameplayStore.recording.value;
    if (!r) return null;
    const index = currentSceneEventIndex.value;
    if (index === null) return null;

    return r.sceneEvents[index] ?? null;
});

export const currentFrameEndEventIndex = computed(() => {
    return gameplayStore.recording.value?.frameEndEventIndexFromMs(msIntoGame.value) ?? null;
});
export const currentFrameEndEvent = computed(() => {
    const r = gameplayStore.recording.value;
    if (!r) return null;
    const index = currentFrameEndEventIndex.value;
    if (index === null) return null;

    return r.frameEndEvents[index] ?? null;
});

export const animationStore = {
    msIntoGame,
    currentSceneEventIndex,
    currentSceneEvent,
    currentFrameEndEventIndex,
    currentFrameEndEvent,
};
