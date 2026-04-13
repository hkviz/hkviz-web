import { formatNumberVar } from './aggregation-formatting';
import { AggregationVariableSilk } from './aggregation-value-silk';
import { AggregationVariable } from './aggregation-variable';
import { AggregationVariableInfo, aggregationVariableInfosShared } from './aggregation-variable-info-shared';

export const aggregationVariableInfosSilk: Record<AggregationVariableSilk, AggregationVariableInfo> = {
	...aggregationVariableInfosShared,
	focusing: {
		name: 'Heals',
		key: 'focusing' as AggregationVariable,
		format: formatNumberVar,
		description: 'Number of times the player started to heal.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	},
	shellShardsEarned: {
		name: 'Shell Shards Earned',
		key: 'shellShardsEarned' as AggregationVariable,
		format: formatNumberVar,
		description: 'Number of shell shards earned by the player.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	},
	shellShardsSpent: {
		name: 'Shell Shards Spent',
		key: 'shellShardsSpent' as AggregationVariable,
		format: formatNumberVar,
		description: 'Number of shell shards spent by the player.',
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	},
};
