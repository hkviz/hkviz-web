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

export const aggregationVariableInfosShared: Record<AggregationVariableShared, AggregationVariableInfo> = {
	visits: {
		name: 'Visits',
		key: 'visits' as AggregationVariable,
		format: formatNumberVar,
		description: 'Number of times this scene/area has been entered.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	},
	firstVisitMs: {
		name: 'First visited at',
		key: 'firstVisitMs' as AggregationVariable,
		format: formatTimeMsVar,
		description: 'Time of first visit',
		isTimestamp: true,
		showHistory: false,
		showHistoryDelta: false,
	},
	visitOrder: {
		name: 'Visit Order',
		key: 'visitOrder' as AggregationVariable,
		format: formatNumberVar,
		description:
			'The order this scene or area was first visited (e.g., 5 means four others were first visited before it).',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	},
	timeSpendMs: {
		name: 'Time spent',
		key: 'timeSpendMs' as AggregationVariable,
		format: formatTimeMsVar,
		description: 'Total time spent in a scene/area of all visits combined.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	},
	damageTaken: {
		name: 'Damage taken',
		key: 'damageTaken' as AggregationVariable,
		format: formatNumberVar,
		description: 'Total damage taken in masks',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	},
	deaths: {
		name: 'Deaths',
		key: 'deaths' as AggregationVariable,
		format: formatNumberVar,
		description: 'Number of times the player died in a scene/area.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	},
	geoEarned: {
		name: 'Geo earned',
		key: 'geoEarned' as AggregationVariable,
		format: formatNumberVar,
		description: 'Does not include geo earned by defeating the shade.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	},
	geoSpent: {
		name: 'Geo spent',
		key: 'geoSpent' as AggregationVariable,
		format: formatNumberVar,
		description: 'Does not include Geo lost by dying and not defeating the shade.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	},
};
