import { computed, effect, signal } from '@preact/signals-react';
import { type CombinedRecording } from '../viz/recording-files/recording';

export const msIntoGame = signal(0);
export const recording = signal<CombinedRecording | null>(null);

export const currentSceneEventIndex = computed(() => {
    return recording.value?.sceneEventIndexFromMs(msIntoGame.value) ?? null;
});
export const currentSceneEvent = computed(() => {
    const r = recording.value;
    if (!r) return null;
    const index = currentSceneEventIndex.value;
    if (index === null) return null;

    return r.sceneEventFromMs(index) ?? null;
});

export const currentFrameEndEventIndex = computed(() => {
    return recording.value?.frameEndEventIndexFromMs(msIntoGame.value) ?? null;
});
export const currentFrameEndEvent = computed(() => {
    const r = recording.value;
    if (!r) return null;
    const index = currentFrameEndEventIndex.value;
    if (index === null) return null;

    return r.frameEndEventFromMs(index) ?? null;
});

effect(() => {
    console.log(currentSceneEvent.value);
});
