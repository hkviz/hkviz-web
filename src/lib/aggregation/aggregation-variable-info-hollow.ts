import { formatNumberVar } from './aggregation-formatting';
import { AggregationVariableHollow } from './aggregation-value-hollow';
import {
	aggregationVariableInfo,
	AggregationVariableInfo,
	aggregationVariableInfosShared,
} from './aggregation-variable-info-shared';

export const aggregationVariableInfosHollow: {
	[key in AggregationVariableHollow]: AggregationVariableInfo;
} = {
	...aggregationVariableInfosShared,
	...aggregationVariableInfo({
		name: 'Focusing',
		key: 'focusing',
		format: formatNumberVar,
		description: 'Number of times healing was started.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	}),
	...aggregationVariableInfo({
		name: 'Vengeful Spirit',
		key: 'spellFireball',
		format: formatNumberVar,
		description: 'Number of times a fireball Spell was used.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	}),
	...aggregationVariableInfo({
		name: 'Desolate Dive',
		key: 'spellDown',
		format: formatNumberVar,
		description: 'Number of times a downwards Spell was used.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	}),
	...aggregationVariableInfo({
		name: 'Howling Wraiths',
		key: 'spellUp',
		format: formatNumberVar,
		description: 'Number of times an upwards Spell was used.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	}),
	...aggregationVariableInfo({
		name: 'Geo earned',
		key: 'geoEarned',
		format: formatNumberVar,
		description: 'Does not include Geo earned by defeating the Shade.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	}),
	...aggregationVariableInfo({
		name: 'Geo spent',
		key: 'geoSpent',
		format: formatNumberVar,
		description: 'Does not include Geo lost by dying and not defeating the Shade.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	}),
	...aggregationVariableInfo({
		name: 'Essence earned',
		key: 'essenceEarned',
		format: formatNumberVar,
		description: 'Essence obtained by e.g. defeating dream bosses, or collecting orbs from whispering roots.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	}),
	...aggregationVariableInfo({
		name: 'Essence spent',
		key: 'essenceSpent',
		format: formatNumberVar,
		description: 'Essence spent by using the dream gate.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	}),
};
