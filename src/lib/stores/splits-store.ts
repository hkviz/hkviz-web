import { computed, signal } from '@preact/signals-react';
import { recordingSplitGroups, type RecordingSplit } from '../viz/recording-files/recording-splits';
import { animationStore } from './animation-store';
import { gameplayStore } from './gameplay-store';

const visibleSplitGroups = signal(recordingSplitGroups.filter((it) => it.defaultShown));

function reset() {
    visibleSplitGroups.value = recordingSplitGroups.filter((it) => it.defaultShown);
}

const filteredSplits = computed<readonly RecordingSplit[]>(() => {
    const recording = gameplayStore.recording.value;
    if (!recording) return [];
    const visibleGroups = visibleSplitGroups.value;
    return recording.splits?.filter((it) => visibleGroups.includes(it.group)) ?? [];
});

const nextSplitIndex = computed(() => {
    const msIntoGame = animationStore.msIntoGame.value;
    const splits = filteredSplits.value;
    const nextSplitIndex = splits.findIndex(
        (split, index) => split.msIntoGame >= msIntoGame && splits[index + 1]?.msIntoGame !== split.msIntoGame,
    );

    return nextSplitIndex;
});

export const splitsStore = {
    visibleSplitGroups,
    filteredSplits,
    nextSplitIndex,
    reset,
};
