import { formatNumberVar, formatTimeMsVar } from './aggregation-formatting';
import { AggregationVariableShared } from './aggregation-value-base';
import { AggregationVariable } from './aggregation-variable';

export interface AggregationVariableInfo {
	name: string;
	key: AggregationVariable;
	format: (value: number | null) => number | string;
	description: string;
	isTimestamp: boolean;
	showHistory: boolean;
	showHistoryDelta: boolean;
}

export function aggregationVariableInfo<TVariable extends string>(
	info: Omit<AggregationVariableInfo, 'key'> & { key: TVariable },
): { [K in TVariable]: AggregationVariableInfo } {
	return {
		[info.key]: info,
	} as any;
}

export const aggregationVariableInfosShared: Record<
	Exclude<AggregationVariableShared, 'geoEarned' | 'geoSpent'>,
	AggregationVariableInfo
> = {
	...aggregationVariableInfo({
		name: 'Visits',
		key: 'visits',
		format: formatNumberVar,
		description: 'Number of times this scene/area has been entered.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	}),
	...aggregationVariableInfo({
		name: 'First visited at',
		key: 'firstVisitMs',
		format: formatTimeMsVar,
		description: 'Time of first visit',
		isTimestamp: true,
		showHistory: false,
		showHistoryDelta: false,
	}),
	...aggregationVariableInfo({
		name: 'Visit Order',
		key: 'visitOrder',
		format: formatNumberVar,
		description:
			'The order this scene or area was first visited (e.g., 5 means four others were first visited before it).',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	}),
	...aggregationVariableInfo({
		name: 'Time spent',
		key: 'timeSpendMs',
		format: formatTimeMsVar,
		description: 'Total time spent in a scene/area of all visits combined.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	}),
	...aggregationVariableInfo({
		name: 'Damage taken',
		key: 'damageTaken',
		format: formatNumberVar,
		description: 'Total damage taken in masks',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	}),
	...aggregationVariableInfo({
		name: 'Deaths',
		key: 'deaths',
		format: formatNumberVar,
		description: 'Number of times the player died in a scene/area.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	}),
};
