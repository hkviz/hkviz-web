import { type RecordingSplit } from '@hkviz/parser';
import { splitsStore as splitsStoreSolid } from '@hkviz/viz';
import { computed, signal } from '@preact/signals-react';
import Fuse from 'fuse.js';
import { animationStore } from './animation-store';
import { gameplayStore } from './gameplay-store';

const filteredByGroupSplits = computed<readonly RecordingSplit[]>(() => {
    const recording = gameplayStore.recording.valuePreact;
    if (!recording) return [];
    const visibleGroups = splitsStoreSolid.visibleSplitGroups.valuePreact;
    return recording.splits?.filter((it) => visibleGroups.includes(it.group)) ?? [];
});

const splitsFuse = computed(
    () =>
        new Fuse(filteredByGroupSplits.value, {
            keys: [
                { name: 'title', weight: 2 },
                // { name: 'description', weight: 2 },
            ],
            shouldSort: false,
            threshold: 0.3,
            ignoreLocation: true,
        }),
);
const filteredSplits = computed<readonly RecordingSplit[]>(() => {
    const term = splitsStoreSolid.filterTerm.valuePreact.toLowerCase();
    const splits = filteredByGroupSplits.value;
    if (!term) return splits;
    return splitsFuse.value.search(term).map((it) => it.item);
});

const nextSplitIndex = computed(() => {
    const msIntoGame = animationStore.msIntoGame.valuePreact;
    const splits = filteredSplits.value;
    const nextSplitIndex = splits.findIndex(
        (split, index) => split.msIntoGame >= msIntoGame && splits[index + 1]?.msIntoGame !== split.msIntoGame,
    );

    return nextSplitIndex;
});

const isSplitsPanelOpen = signal(false);

export const splitsStore = {
    ...splitsStoreSolid,
    filteredSplits,
    nextSplitIndex,
    isSplitsPanelOpen,
};
