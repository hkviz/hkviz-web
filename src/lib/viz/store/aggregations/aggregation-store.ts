import { createContext, createMemo, createSignal, useContext } from 'solid-js';
import { assertNever, binarySearchLastIndexBefore } from '../../../parser';
import { AnimationStore } from '../animation-store';
import { GameplayStore } from '../gameplay-store';
import { RoomDisplayStore } from '../room-display-store';
import {
	aggregateRecording,
	AggregationVariable,
	aggregationVariableDefaultValue,
	getVirtualSceneName,
	isAggregationTimepoint,
	ValueAggregation,
	ValueAggregationTimePoint,
} from './aggregate-recording';

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

export function createAggregationStore(
	roomDisplayStore: RoomDisplayStore,
	animationStore: AnimationStore,
	gameplayStore: GameplayStore,
) {
	const aggregations = createMemo(() => {
		const recording = gameplayStore.recording();
		if (!recording) return null;
		return aggregateRecording(recording);
	});

	const selectedVirtualScene = createMemo(() => {
		const selectedSceneName = roomDisplayStore.selectedSceneName();
		if (!selectedSceneName) return null;
		const mode = roomDisplayStore.areaSelectionMode();
		return getVirtualSceneName(selectedSceneName, mode);
	});

	const [viewNeverHappenedAggregations, setViewNeverHappenedAggregations] = createSignal(false);

	const [aggregationCountMode, setAggregationCountMode] = createSignal<AggregationCountMode>('total');

	function getAggregations(virtualSceneName: string): ValueAggregation | null {
		// console.log('getAggregations', sceneName);
		const aggregations_ = aggregations();
		if (!aggregations_) return null;
		const mode = aggregationCountMode();
		if (mode === 'total') return aggregations_.countPerScene[virtualSceneName] ?? null;
		if (mode === 'until-current-time') {
			const timePoints = aggregations_.countPerSceneOverTime[virtualSceneName];
			if (!timePoints) return null;
			const msIntoGame = animationStore.msIntoGame();
			const currentIndex = binarySearchLastIndexBefore(timePoints, msIntoGame, (it) => it.msIntoGame);
			return currentIndex !== -1 ? (timePoints[currentIndex] ?? null) : null;
		}

		assertNever(mode);
	}

	function getAggregationHistory(
		virtualSceneName: string,
		variable: AggregationVariable,
	): ValueAggregationTimePoint[] {
		const aggregations_ = aggregations();
		if (!aggregations_) return [];
		const filtered: ValueAggregationTimePoint[] = [];
		let previousValue: number | null = aggregationVariableDefaultValue(variable);
		aggregations_?.countPerSceneOverTime[virtualSceneName]?.forEach((timePoint) => {
			const value = timePoint[variable];
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
		aggregation: ValueAggregation | null,
		variable: AggregationVariable,
		msIntoGame: () => number,
	): number | null {
		if (!aggregation) return aggregationVariableDefaultValue(variable);
		const value = aggregation[variable];
		if (variable === 'timeSpendMs' && isAggregationTimepoint(aggregation) && aggregation.isActiveScene) {
			return (value ?? 0) + msIntoGame() - aggregation.msIntoGame;
		} else {
			return value;
		}
	}

	function getCorrectedAggregationValueNullIfUnvisited(
		aggregation: ValueAggregation | null,
		variable: AggregationVariable,
		msIntoGame: () => number,
	): number | null {
		if (!aggregation || aggregation.visits === 0) return null;
		return getCorrectedAggregationValue(aggregation, variable, msIntoGame);
	}

	return {
		data: aggregations,
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
	};
}
export type AggregationStore = ReturnType<typeof createAggregationStore>;

export const AggregationStoreContext = createContext<AggregationStore>();

export function useAggregationStore() {
	const store = useContext(AggregationStoreContext);
	if (!store) throw new Error('No AggregationStoreContext provided');
	return store;
}
