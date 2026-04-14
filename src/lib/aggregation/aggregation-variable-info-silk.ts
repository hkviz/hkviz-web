import { formatNumberVar } from './aggregation-formatting';
import { AggregationVariableSilk } from './aggregation-value-silk';
import {
	aggregationVariableInfo,
	AggregationVariableInfo,
	aggregationVariableInfosShared,
} from './aggregation-variable-info-shared';

export const aggregationVariableInfosSilk: Record<AggregationVariableSilk, AggregationVariableInfo> = {
	...aggregationVariableInfosShared,
	...aggregationVariableInfo({
		name: 'Binds',
		key: 'focusing',
		format: formatNumberVar,
		description: 'Number of times healing was started.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	}),
	...aggregationVariableInfo({
		name: 'Rosaries earned',
		key: 'geoEarned',
		format: formatNumberVar,
		description: 'Does not include Rosaries earned by collecting the corpse.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	}),
	...aggregationVariableInfo({
		name: 'Rosaries spent',
		key: 'geoSpent',
		format: formatNumberVar,
		description: 'Does not include Rosaries lost by dying and not collecting the corpse.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	}),
	...aggregationVariableInfo({
		name: 'Shell Shards earned',
		key: 'shellShardsEarned',
		format: formatNumberVar,
		description: 'Number of shell shards earned.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	}),
	...aggregationVariableInfo({
		name: 'Shell Shards used',
		key: 'shellShardsSpent',
		format: formatNumberVar,
		description: 'Number of shell shards spent.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	}),
};
