import { computed, signal } from '@preact/signals-react';
import Fuse from 'fuse.js';
import { recordingSplitGroups, type RecordingSplit } from '../viz/recording-files/recording-splits';
import { animationStore } from './animation-store';
import { gameplayStore } from './gameplay-store';

const visibleSplitGroups = signal(recordingSplitGroups.filter((it) => it.defaultShown));
const filterTerm = signal('');

function reset() {
    visibleSplitGroups.value = recordingSplitGroups.filter((it) => it.defaultShown);
    filterTerm.value = '';
}

const filteredByGroupSplits = computed<readonly RecordingSplit[]>(() => {
    const recording = gameplayStore.recording.value;
    if (!recording) return [];
    const visibleGroups = visibleSplitGroups.value;
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
    const term = filterTerm.value.toLowerCase();
    const splits = filteredByGroupSplits.value;
    if (!term) return splits;
    return splitsFuse.value.search(term).map((it) => it.item);
});

const nextSplitIndex = computed(() => {
    const msIntoGame = animationStore.msIntoGame.value;
    const splits = filteredSplits.value;
    const nextSplitIndex = splits.findIndex(
        (split, index) => split.msIntoGame >= msIntoGame && splits[index + 1]?.msIntoGame !== split.msIntoGame,
    );

    return nextSplitIndex;
});

const isSplitsPanelOpen = signal(false);

export const splitsStore = {
    filterTerm,
    visibleSplitGroups,
    filteredSplits,
    nextSplitIndex,
    isSplitsPanelOpen,
    reset,
};
