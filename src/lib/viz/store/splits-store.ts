import Fuse from 'fuse.js';
import { createContext, createMemo, createSignal, useContext } from 'solid-js';
import { createMutableMemo } from '~/lib/create-mutable-memo';
import type { Split } from '~/lib/splits/splits-shared/split';
import type { AnimationStore } from './animation-store';
import type { GameplayStore } from './gameplay-store';
import type { LocalizationStore } from './localization-store';
import { binarySearchLastIndexBefore } from '~/lib/util/binary-search';

export type LocalizedSplit = Split & { localizedTitle: string };

export function createSplitsStore(
	gameplayStore: GameplayStore,
	animationStore: AnimationStore,
	localizationStore: LocalizationStore,
) {
	const defaultSplitGroups = () => {
		const gameModule = gameplayStore.gameModule();
		return gameModule?.splitGroups.filter((it) => it.defaultShown) ?? [];
	};

	const [visibleSplitGroups, setVisibleSplitGroups] = createMutableMemo(defaultSplitGroups);
	const [displayBeforeRunStart, setDisplayBeforeRunStart] = createSignal(false);
	const [filterTerm, setFilterTerm] = createSignal('');

	function reset() {
		setVisibleSplitGroups(defaultSplitGroups());
		setFilterTerm('');
		setDisplayBeforeRunStart(false);
	}

	const splitsLocalized = createMemo<readonly LocalizedSplit[]>(() => {
		const recording = gameplayStore.recording();
		if (!recording) return [];
		return (
			recording.splits?.map((split) => ({
				...split,
				localizedTitle: localizationStore.getString(split.title),
			})) ?? []
		);
	});

	const filteredByGroupSplits = createMemo<readonly LocalizedSplit[]>(() => {
		const recording = gameplayStore.recording();
		if (!recording) return [];
		const visibleGroups = visibleSplitGroups();
		return (
			splitsLocalized()?.filter((it) => {
				return visibleGroups.includes(it.group);
			}) ?? []
		);
	});

	const splitsFuse = createMemo(
		() =>
			new Fuse(filteredByGroupSplits(), {
				keys: [
					{ name: 'localizedTitle', weight: 2 },
					// { name: 'description', weight: 2 },
				],
				shouldSort: false,
				threshold: 0.3,
				ignoreLocation: true,
			}),
	);

	const filteredSplitsAll = createMemo<readonly LocalizedSplit[]>(() => {
		const term = filterTerm().toLowerCase();
		const splits = filteredByGroupSplits();
		if (!term) return splits;
		return splitsFuse()
			.search(term)
			.map((it) => it.item);
	});

	const hasSplitsBeforeRunStart = createMemo(() => {
		const splits = filteredSplitsAll();
		return splits.length > 0 && splits[0].msIntoGame < 1;
	});

	const toggleDisplayBeforeRunStart = () => {
		setDisplayBeforeRunStart((prev) => !prev);
	};

	const filteredSplits = createMemo<readonly LocalizedSplit[]>(() => {
		const splits = filteredSplitsAll();
		if (displayBeforeRunStart()) return splits;
		const index = binarySearchLastIndexBefore(splits, 1, (split) => split.msIntoGame);
		return splits.slice(index + 1);
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
		displayBeforeRunStart,
		setDisplayBeforeRunStart,
		toggleDisplayBeforeRunStart,
		hasSplitsBeforeRunStart,
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
