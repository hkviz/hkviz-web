import { PlayIcon, Settings2Icon, SigmaIcon } from 'lucide-solid';
import { createContext, createMemo, createSignal, useContext } from 'solid-js';
import { type AggregationTimePointBase, type AggregationValueBase } from '~/lib/aggregation/aggregation-value-base';
import { isAggregationTimepoint } from '~/lib/aggregation/aggregation-value-specific';
import type { AggregationVariable } from '~/lib/aggregation/aggregation-variable';
import type { AggregationVariableInfo } from '~/lib/aggregation/aggregation-variable-info-shared';
import { binarySearchLastIndexBefore } from '~/lib/util/binary-search';
import { assertNever } from '~/lib/util/other';
import type { AnimationStore } from './animation-store';
import type { GameplayStore } from './gameplay-store';
import type { AreaSelectionMode, RoomDisplayStore } from './room-display-store';
import { virtualSceneName } from '~/lib/aggregation/virtual-scene-name';
import { createMutableMemo } from '~/lib/create-mutable-memo';

export type AggregationCountMode = 'total' | 'until-current-time' | 'custom';
export const aggregationCountModes = ['until-current-time', 'total', 'custom'] as AggregationCountMode[];
export function getAggregationCountModeLabel(mode: AggregationCountMode) {
	if (mode === 'total') return 'Totals';
	if (mode === 'until-current-time') return 'Until now';
	if (mode === 'custom') return 'Custom';
	return assertNever(mode);
}
export function getAggregationCountModeDescription(mode: AggregationCountMode) {
	if (mode === 'total') return 'Shows the stats for the complete gameplay, ignoring the selected time.';
	if (mode === 'until-current-time') return 'Shows the stats up to the selected time in the timeline.';
	if (mode === 'custom') return 'Shows the stats only within a custom timespan, selectable below the timeline.';
	return assertNever(mode);
}
export function getAggregationCountModeIcon(mode: AggregationCountMode) {
	if (mode === 'total') {
		return SigmaIcon;
	}
	if (mode === 'until-current-time') {
		return PlayIcon;
	}
	if (mode === 'custom') {
		return Settings2Icon;
	}
	return assertNever(mode);
}

export function createAggregationStore(
	roomDisplayStore: RoomDisplayStore,
	animationStore: AnimationStore,
	gameplayStore: GameplayStore,
) {
	const recording = gameplayStore.recording;

	const aggregations = createMemo(() => {
		const recording_ = recording();
		const gameplayModule = gameplayStore.gameModule();
		if (recording_ == null || gameplayModule == null) return null;
		return gameplayModule.aggregation.fromRecording(
			recording_ as never,
			gameplayStore.timeFrameDisplay().min,
			gameplayStore.timeFrameDisplay().max,
		);
	});

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
			const roomData = gameplayStore.gameModule()?.map.getMainRoomDataBySceneName(sceneName);
			const zoneName = roomData?.zoneNameFormatted;
			return zoneName ? virtualSceneName.zone(zoneName) : null;
		}
		if (mode === 'all') return virtualSceneName.all;
		return assertNever(mode);
	}

	function getVirtualSceneNameForHeatMap(sceneName: string): string {
		const mode = roomDisplayStore.areaSelectionMode();
		if (mode === 'all') return sceneName;
		return getVirtualSceneName(sceneName, mode) ?? sceneName;
	}

	const [viewNeverHappenedAggregations, setViewNeverHappenedAggregations] = createSignal(false);

	const [aggregationCountMode, setAggregationCountMode] = createSignal<AggregationCountMode>('total');

	const [aggregationTimeFrameCustomMin, setAggregationTimeFrameCustomMin] = createMutableMemo<number>(
		() => gameplayStore.timeFrameDisplay().min,
	);
	const [aggregationTimeFrameCustomMax, setAggregationTimeFrameCustomMax] = createMutableMemo<number>(
		() => gameplayStore.timeFrameDisplay().max,
	);

	const aggregationTimeframeMin = createMemo(() => {
		// when null include aggregations from beginning
		const mode = aggregationCountMode();
		if (mode === 'custom') {
			return aggregationTimeFrameCustomMin();
		}
		// aggregation already considers include/exclude of pre-recording events.
		return null;
	});
	const aggregationTimeframeMax = createMemo(() => {
		const mode = aggregationCountMode();
		if (mode === 'custom') return aggregationTimeFrameCustomMax();
		if (mode === 'total') return null;
		if (mode === 'until-current-time') {
			return animationStore.msIntoGame();
		}
		return assertNever(mode);
	});

	function getAggregationsTimeframeStart(virtualSceneName: string): AggregationTimePointBase | null {
		const aggregations_ = aggregations();
		if (!aggregations_) return null;
		const min = aggregationTimeframeMin();

		if (min == null) {
			return null;
		} else {
			const timePoints = aggregations_.countPerSceneOverTime[virtualSceneName] as
				| AggregationTimePointBase[]
				| undefined;
			if (!timePoints) return null;
			const currentIndex = binarySearchLastIndexBefore(timePoints, min, (it) => it.msIntoGame);
			return currentIndex !== -1 ? (timePoints[currentIndex] ?? null) : null;
		}
	}

	function getAggregationsTimeframeEnd(virtualSceneName: string): AggregationValueBase | null {
		const aggregations_ = aggregations();
		if (!aggregations_) return null;
		const max = aggregationTimeframeMax();

		if (max == null) {
			return aggregations_.countPerScene[virtualSceneName] ?? aggregations_.DEFAULT;
		} else {
			const timePoints = aggregations_.countPerSceneOverTime[virtualSceneName] as
				| AggregationTimePointBase[]
				| undefined;
			if (!timePoints) return null;
			const currentIndex = binarySearchLastIndexBefore(timePoints, max, (it) => it.msIntoGame);
			return currentIndex !== -1 ? (timePoints[currentIndex] ?? aggregations_.DEFAULT) : aggregations_.DEFAULT;
		}
	}

	function getCurrentCorrectedAggregationValue(
		virtualSceneName: string,
		variable: AggregationVariable,
		nullIfUnvisited: boolean = false,
	): number | null {
		const aggregationStart = getAggregationsTimeframeStart(virtualSceneName);
		const aggregationsEnd = getAggregationsTimeframeEnd(virtualSceneName);

		return getCorrectedAggregationValue(
			aggregationTimeframeMin(),
			virtualSceneName,
			aggregationStart,
			aggregationsEnd,
			variable,
			animationStore.msIntoGame,
			nullIfUnvisited,
		);
	}

	function getAggregationHistory(
		virtualSceneName: string,
		variable: AggregationVariable,
	): AggregationTimePointBase[] {
		const aggregations_ = aggregations();
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

	const visibleRoomAggregationsStart = createMemo(() => {
		const virtualSceneName = selectedVirtualScene();
		if (!virtualSceneName) return null;
		return getAggregationsTimeframeStart(virtualSceneName);
	});

	const visibleRoomAggregationsEnd = createMemo(() => {
		const virtualSceneName = selectedVirtualScene();
		if (!virtualSceneName) return null;
		// console.log('visibleRoomAggregations', virtualSceneName, animationStore.msIntoGame());
		return getAggregationsTimeframeEnd(virtualSceneName);
	});

	function getCorrectedAggregationValue(
		minTime: number | null,
		virtualSceneName: string,
		aggregationStart: AggregationTimePointBase | null,
		aggregationEnd: AggregationValueBase | null,
		variable: AggregationVariable,
		msIntoGame: () => number,
		nullIfUnvisited: boolean = false,
	): number | null {
		if (!aggregationEnd) return gameplayStore.gameModule()?.aggregation.DEFAULT_VALUES.getValue(variable) ?? null;
		if (aggregationEnd.visits === 0 && nullIfUnvisited) return null;
		const value = aggregationEnd.getValue(variable) as number | null;

		const defaultValue = aggregations()?.DEFAULT?.getValue(variable) as number | null;
		// TODO should theoretically use corrected value as subtract
		const subtract = defaultValue == null ? null : (aggregationStart?.getValue(variable) ?? null);
		const subtractOrZero = subtract ?? 0;

		if (
			nullIfUnvisited &&
			!(isAggregationTimepoint(aggregationEnd) && aggregationEnd.isActiveScene) &&
			aggregationStart &&
			!aggregationStart.isActiveScene &&
			aggregationEnd.visits === aggregationStart.visits
		) {
			return null;
		}

		if (
			variable === 'firstVisitMs' &&
			aggregationStart != null &&
			minTime != null &&
			value != null &&
			value < minTime
		) {
			// find first visit time after start
			const timePoints = aggregations()?.countPerSceneOverTime[virtualSceneName] as
				| AggregationTimePointBase[]
				| undefined;
			if (!timePoints) return null;
			const firstIndex = binarySearchLastIndexBefore(timePoints, minTime, (it) => it.msIntoGame);
			if (firstIndex === -1) return null;
			const visitsBefore = firstIndex === -1 ? 0 : timePoints[firstIndex].visits;
			for (let i = firstIndex + 1; i < timePoints.length; i++) {
				const timePoint = timePoints[i];
				if (timePoint.visits > visitsBefore) {
					return timePoint.msIntoGame;
				}
			}
			return null;
		} else if (
			variable === 'timeSpendMs' &&
			isAggregationTimepoint(aggregationEnd) &&
			aggregationEnd.isActiveScene &&
			msIntoGame() >= 0
		) {
			return (value ?? 0) + msIntoGame() - aggregationEnd.msIntoGame - subtractOrZero;
		} else {
			return value == null ? null : value - subtractOrZero;
		}
	}

	function getInfo(variable: AggregationVariable) {
		const gameModule = gameplayStore.gameModule();
		return gameModule?.aggregation?.variableInfos?.[variable as any] as AggregationVariableInfo | undefined;
	}

	return {
		aggregations,
		getAggregationsTimeframeStart,
		getAggregationsTimeframeEnd,
		viewNeverHappenedAggregations,
		setViewNeverHappenedAggregations,
		visibleRoomAggregationsStart,
		visibleRoomAggregationsEnd,
		aggregationCountMode,
		setAggregationCountMode,
		getCorrectedAggregationValue,
		getAggregationHistory,
		selectedVirtualScene,
		getInfo,
		getVirtualSceneName,
		getVirtualSceneNameForHeatMap,
		getCurrentCorrectedAggregationValue,
		aggregationTimeFrameCustomMin,
		setAggregationTimeFrameCustomMin,
		aggregationTimeFrameCustomMax,
		setAggregationTimeFrameCustomMax,
	};
}
export type AggregationStore = ReturnType<typeof createAggregationStore>;

export const AggregationStoreContext = createContext<AggregationStore>();

export function useAggregationStore() {
	const store = useContext(AggregationStoreContext);
	if (!store) throw new Error('No AggregationStoreContext provided');
	return store;
}
