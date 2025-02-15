import { recordingSplitGroups, type RecordingSplit } from '../../parser';
import Fuse from 'fuse.js';
import { createContext, createMemo, createSignal, useContext } from 'solid-js';
import { GameplayStore } from './gameplay-store';
import { AnimationStore } from './animation-store';

export function createSplitsStore(gameplayStore: GameplayStore, animationStore: AnimationStore) {
	const [visibleSplitGroups, setVisibleSplitGroups] = createSignal(
		recordingSplitGroups.filter((it) => it.defaultShown),
	);
	const [filterTerm, setFilterTerm] = createSignal('');

	function reset() {
		setVisibleSplitGroups(recordingSplitGroups.filter((it) => it.defaultShown));
		setFilterTerm('');
	}

	const filteredByGroupSplits = createMemo<readonly RecordingSplit[]>(() => {
		const recording = gameplayStore.recording();
		if (!recording) return [];
		const visibleGroups = visibleSplitGroups();
		return recording.splits?.filter((it) => visibleGroups.includes(it.group)) ?? [];
	});

	const splitsFuse = createMemo(
		() =>
			new Fuse(filteredByGroupSplits(), {
				keys: [
					{ name: 'title', weight: 2 },
					// { name: 'description', weight: 2 },
				],
				shouldSort: false,
				threshold: 0.3,
				ignoreLocation: true,
			}),
	);
	const filteredSplits = createMemo<readonly RecordingSplit[]>(() => {
		const term = filterTerm().toLowerCase();
		const splits = filteredByGroupSplits();
		if (!term) return splits;
		return splitsFuse()
			.search(term)
			.map((it) => it.item);
	});

	const nextSplitIndex = createMemo(() => {
		const msIntoGame = animationStore.msIntoGame();
		const splits = filteredSplits();
		const nextSplitIndex = splits.findIndex(
			(split, index) => split.msIntoGame >= msIntoGame && splits[index + 1]?.msIntoGame !== split.msIntoGame,
		);

		return nextSplitIndex;
	});

	const [isSplitsPanelOpen, setIsSplitsPanelOpen] = createSignal(false);

	return {
		filterTerm,
		setFilterTerm,
		visibleSplitGroups,
		setVisibleSplitGroups,
		filteredSplits,
		nextSplitIndex,
		isSplitsPanelOpen,
		setIsSplitsPanelOpen,
		reset,
	};
}
export type SplitsStore = ReturnType<typeof createSplitsStore>;
export const SplitsStoreContext = createContext<SplitsStore>();
export function useSplitsStore() {
	const store = useContext(SplitsStoreContext);
	if (!store) throw new Error('No SplitsStoreContext found');
	return store;
}
