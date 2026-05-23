import { localized } from '../viz/store/localization-store';
import { formatNumberVar } from './aggregation-formatting';
import type { AggregationVariableHollow } from './aggregation-value-hollow';
import type { AggregationVariableInfo } from './aggregation-variable-info-shared';
import { aggregationVariableInfo, aggregationVariableInfosShared } from './aggregation-variable-info-shared';

export const aggregationVariableInfosHollow: {
	[key in AggregationVariableHollow]: AggregationVariableInfo;
} = {
	...aggregationVariableInfosShared,
	...aggregationVariableInfo({
		name: localized.raw('Focusing'),
		key: 'focusing',
		format: formatNumberVar,
		description: localized.raw('Number of times healing was started.'),
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	}),
	...aggregationVariableInfo({
		name: localized.raw('Vengeful Spirit'),
		key: 'spellFireball',
		format: formatNumberVar,
		description: localized.raw('Number of times a fireball Spell was used.'),
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	}),
	...aggregationVariableInfo({
		name: localized.raw('Desolate Dive'),
		key: 'spellDown',
		format: formatNumberVar,
		description: localized.raw('Number of times a downwards Spell was used.'),
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	}),
	...aggregationVariableInfo({
		name: localized.raw('Howling Wraiths'),
		key: 'spellUp',
		format: formatNumberVar,
		description: localized.raw('Number of times an upwards Spell was used.'),
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	}),
	...aggregationVariableInfo({
		name: localized.raw('Geo earned'),
		key: 'geoEarned',
		format: formatNumberVar,
		description: localized.raw('Does not include Geo earned by defeating the Shade.'),
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	}),
	...aggregationVariableInfo({
		name: localized.raw('Geo spent'),
		key: 'geoSpent',
		format: formatNumberVar,
		description: localized.raw('Does not include Geo lost by dying and not defeating the Shade.'),
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	}),
	...aggregationVariableInfo({
		name: localized.raw('Essence earned'),
		key: 'essenceEarned',
		format: formatNumberVar,
		description: localized.raw(
			'Essence obtained by e.g. defeating dream bosses, or collecting orbs from whispering roots.',
		),
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	}),
	...aggregationVariableInfo({
		name: localized.raw('Essence spent'),
		key: 'essenceSpent',
		format: formatNumberVar,
		description: localized.raw('Essence spent by using the dream gate.'),
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	}),
};
