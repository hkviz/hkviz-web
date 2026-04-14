import { PlayIcon, SigmaIcon } from 'lucide-solid';
import { createContext, createMemo, createSignal, useContext } from 'solid-js';
import { virtualSceneName } from '~/lib/aggregation/aggregate-recording-shared';
import { AggregationTimePointBase, AggregationValueBase } from '~/lib/aggregation/aggregation-value-base';
import { isAggregationTimepoint } from '~/lib/aggregation/aggregation-value-specific';
import { AggregationVariable } from '~/lib/aggregation/aggregation-variable';
import { AggregationVariableInfo } from '~/lib/aggregation/aggregation-variable-info-shared';
import { assertNever, binarySearchLastIndexBefore } from '../../parser';
import { AnimationStore } from './animation-store';
import { GameplayStore } from './gameplay-store';
import { AreaSelectionMode, RoomDisplayStore } from './room-display-store';

export type AggregationCountMode = 'total' | 'until-current-time';
export const aggregationCountModes = ['until-current-time', 'total'] as AggregationCountMode[];
export function getAggregationCountModeLabel(mode: AggregationCountMode) {
	if (mode === 'total') return 'Totals';
	if (mode === 'until-current-time') return 'Until now';
	assertNever(mode);
}
export function getAggregationCountModeDescription(mode: AggregationCountMode) {
	if (mode === 'total') return 'Shows the stats for the complete gameplay, ignoring the selected time.';
	if (mode === 'until-current-time') return 'Shows the stats up to the selected time in the timeline.';
	assertNever(mode);
}
export function getAggregationCountModeIcon(mode: AggregationCountMode) {
	if (mode === 'total') {
		return SigmaIcon;
	}
	if (mode === 'until-current-time') {
		return PlayIcon;
	}
	assertNever(mode);
}

export function createAggregationStore(
	roomDisplayStore: RoomDisplayStore,
	animationStore: AnimationStore,
	gameplayStore: GameplayStore,
) {
	const recording = gameplayStore.recording;
	const selectedVirtualScene = createMemo(() => {
		const selectedSceneName = roomDisplayStore.selectedSceneName();
		if (!selectedSceneName) return null;
		const mode = roomDisplayStore.areaSelectionMode();
		return getVirtualSceneName(selectedSceneName, mode);
	});

	function getVirtualSceneName(sceneName: string, mode: AreaSelectionMode): string | null {
		if (mode === 'room') return sceneName;
		if (mode === 'zone') {
			if (!sceneName) return null;
			const roomData = gameplayStore.gameModule()?.getMainRoomDataBySceneName(sceneName);
			const zoneName = roomData?.zoneNameFormatted;
			return zoneName ? virtualSceneName.zone(zoneName) : null;
		}
		if (mode === 'all') return virtualSceneName.all;
		assertNever(mode);
	}

	function getVirtualSceneNameForHeatMap(sceneName: string): string {
		const mode = roomDisplayStore.areaSelectionMode();
		if (mode === 'all') return sceneName;
		return getVirtualSceneName(sceneName, mode) ?? sceneName;
	}

	const [viewNeverHappenedAggregations, setViewNeverHappenedAggregations] = createSignal(false);

	const [aggregationCountMode, setAggregationCountMode] = createSignal<AggregationCountMode>('total');

	function getAggregations(virtualSceneName: string): AggregationValueBase | null {
		const aggregations_ = recording()?.aggregations;
		if (!aggregations_) return null;
		const mode = aggregationCountMode();
		if (mode === 'total') return aggregations_.countPerScene[virtualSceneName] ?? aggregations_.DEFAULT;
		if (mode === 'until-current-time') {
			const timePoints = aggregations_.countPerSceneOverTime[virtualSceneName] as
				| AggregationTimePointBase[]
				| undefined;
			if (!timePoints) return null;
			const msIntoGame = animationStore.msIntoGame();
			const currentIndex = binarySearchLastIndexBefore(timePoints, msIntoGame, (it) => it.msIntoGame);
			return currentIndex !== -1 ? (timePoints[currentIndex] ?? aggregations_.DEFAULT) : aggregations_.DEFAULT;
		}

		assertNever(mode);
	}

	function getAggregationHistory(
		virtualSceneName: string,
		variable: AggregationVariable,
	): AggregationTimePointBase[] {
		const aggregations_ = recording()?.aggregations;
		if (!aggregations_) return [];
		const filtered: AggregationTimePointBase[] = [];
		let previousValue: number | null =
			gameplayStore.gameModule()?.aggregation.DEFAULT_VALUES.getValue(variable) ?? null;
		aggregations_?.countPerSceneOverTime[virtualSceneName]?.forEach((timePoint) => {
			const value = timePoint.getValue(variable);
			if (value !== previousValue) {
				filtered.push(timePoint);
				previousValue = value;
			}
		});
		return filtered;
	}

	const visibleRoomAggregations = createMemo(() => {
		const virtualSceneName = selectedVirtualScene();
		if (!virtualSceneName) return null;
		// console.log('visibleRoomAggregations', virtualSceneName, animationStore.msIntoGame());
		return getAggregations(virtualSceneName);
	});

	function getCorrectedAggregationValue(
		aggregation: AggregationValueBase | null,
		variable: AggregationVariable,
		msIntoGame: () => number,
	): number | null {
		if (!aggregation) return gameplayStore.gameModule()?.aggregation.DEFAULT_VALUES.getValue(variable) ?? null;
		const value = aggregation.getValue(variable) as number | null;
		if (variable === 'timeSpendMs' && isAggregationTimepoint(aggregation) && aggregation.isActiveScene) {
			return (value ?? 0) + msIntoGame() - aggregation.msIntoGame;
		} else {
			return value;
		}
	}

	function getCorrectedAggregationValueNullIfUnvisited(
		aggregation: AggregationValueBase | null,
		variable: AggregationVariable,
		msIntoGame: () => number,
	): number | null {
		if (!aggregation || aggregation.visits === 0) return null;
		return getCorrectedAggregationValue(aggregation, variable, msIntoGame);
	}

	function getInfo(variable: AggregationVariable) {
		const gameModule = gameplayStore.gameModule();
		return gameModule?.aggregation?.variableInfos?.[variable as any] as AggregationVariableInfo | undefined;
	}

	return {
		getAggregations,
		viewNeverHappenedAggregations,
		setViewNeverHappenedAggregations,
		visibleRoomAggregations,
		aggregationCountMode,
		setAggregationCountMode,
		getCorrectedAggregationValue,
		getAggregationHistory,
		selectedVirtualScene,
		getCorrectedAggregationValueNullIfUnvisited,
		getInfo,
		getVirtualSceneName,
		getVirtualSceneNameForHeatMap,
	};
}
export type AggregationStore = ReturnType<typeof createAggregationStore>;

export const AggregationStoreContext = createContext<AggregationStore>();

export function useAggregationStore() {
	const store = useContext(AggregationStoreContext);
	if (!store) throw new Error('No AggregationStoreContext provided');
	return store;
}
