import { mainRoomDataBySceneName, type RoomData } from '@hkviz/parser';
import { animationStore as animationStoreSolid } from '@hkviz/viz';
import { computed } from '@preact/signals-react';
import { gameplayStore } from './gameplay-store';

const currentSceneEventIndex = computed(() => {
    return (
        gameplayStore.recording.valuePreact?.sceneEventIndexFromMs(animationStoreSolid.msIntoGame.valuePreact) ?? null
    );
});
const currentSceneEvent = computed(() => {
    const r = gameplayStore.recording.valuePreact;
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
    return (
        gameplayStore.recording.valuePreact?.frameEndEventIndexFromMs(animationStoreSolid.msIntoGame.valuePreact) ??
        null
    );
});
const currentFrameEndEvent = computed(() => {
    const r = gameplayStore.recording.valuePreact;
    if (!r) return null;
    const index = currentFrameEndEventIndex.value;
    if (index === null) return null;

    return r.frameEndEvents[index] ?? null;
});

export const animationStore = {
    ...animationStoreSolid,
    currentSceneEventIndex,
    currentSceneEvent,
    currentFrameEndEventIndex,
    currentFrameEndEvent,
    currentSceneEventWithMainMapRoom,
};
