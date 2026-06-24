import { localized, type LocalizedString } from '../viz/store/localization-store';
import { formatMsIntoGameVar, formatNumberVar, formatTimeMsVar } from './aggregation-formatting';
import type { AggregationVariableShared } from './aggregation-value-base';
import type { AggregationVariable } from './aggregation-variable';

export interface AggregationVariableInfo {
	name: LocalizedString;
	key: AggregationVariable;
	format: (value: number | null) => number | string;
	description: LocalizedString;
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
		name: localized.raw('Visits'),
		key: 'visits',
		format: formatNumberVar,
		description: localized.raw('Number of times this scene/area has been entered.'),
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	}),
	...aggregationVariableInfo({
		name: localized.raw('First visited at'),
		key: 'firstVisitMs',
		format: formatMsIntoGameVar,
		description: localized.raw('Time of first visit'),
		isTimestamp: true,
		showHistory: false,
		showHistoryDelta: false,
	}),
	...aggregationVariableInfo({
		name: localized.raw('Visit Order'),
		key: 'visitOrder',
		format: formatNumberVar,
		description: localized.raw(
			'The order this scene or area was first visited (e.g., 5 means four others were first visited before it).',
		),
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	}),
	...aggregationVariableInfo({
		name: localized.raw('Time spent'),
		key: 'timeSpendMs',
		format: formatTimeMsVar,
		description: localized.raw('Total time spent in a scene/area of all visits combined.'),
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	}),
	...aggregationVariableInfo({
		name: localized.raw('Damage taken'),
		key: 'damageTaken',
		format: formatNumberVar,
		description: localized.raw('Total damage taken in masks'),
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	}),
	...aggregationVariableInfo({
		name: localized.raw('Deaths'),
		key: 'deaths',
		format: formatNumberVar,
		description: localized.raw('Number of times the hero died in a scene/area.'),
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	}),
};
