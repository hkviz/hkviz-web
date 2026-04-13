import { formatNumberVar } from './aggregation-formatting';
import { AggregationVariableHollow } from './aggregation-value-hollow';
import { AggregationVariable } from './aggregation-variable';
import { AggregationVariableInfo, aggregationVariableInfosShared } from './aggregation-variable-info-shared';

export const aggregationVariableInfosHollow: {
	[key in AggregationVariableHollow]: AggregationVariableInfo;
} = {
	...aggregationVariableInfosShared,
	focusing: {
		name: 'Focusing',
		key: 'focusing' as AggregationVariable,
		format: formatNumberVar,
		description: 'Number of times the player started to focus.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	},
	spellFireball: {
		name: 'Vengeful Spirit',
		key: 'spellFireball' as AggregationVariable,
		format: formatNumberVar,
		description: 'Number of times the player used a fireball spell.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	},
	spellDown: {
		name: 'Desolate Dive',
		key: 'spellDown' as AggregationVariable,
		format: formatNumberVar,
		description: 'Number of times the player used a downwards spell.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	},
	spellUp: {
		name: 'Howling Wraiths',
		key: 'spellUp' as AggregationVariable,
		format: formatNumberVar,
		description: 'Number of times the player used an upwards spell.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	},
	essenceEarned: {
		name: 'Essence earned',
		key: 'essenceEarned' as AggregationVariable,
		format: formatNumberVar,
		description: 'Essence obtained by e.g. defeating dream bosses, or collecting orbs from whispering roots.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	},
	essenceSpent: {
		name: 'Essence spent',
		key: 'essenceSpent' as AggregationVariable,
		format: formatNumberVar,
		description: 'Essence spent by using the dream gate.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	},
};
