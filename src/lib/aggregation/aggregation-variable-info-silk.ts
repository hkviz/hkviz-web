import { localized } from '../viz/store/localization-store';
import { formatNumberVar } from './aggregation-formatting';
import type { AggregationVariableSilk } from './aggregation-value-silk';
import type { AggregationVariableInfo } from './aggregation-variable-info-shared';
import { aggregationVariableInfo, aggregationVariableInfosShared } from './aggregation-variable-info-shared';

export const aggregationVariableInfosSilk: Record<AggregationVariableSilk, AggregationVariableInfo> = {
	...aggregationVariableInfosShared,
	...aggregationVariableInfo({
		name: localized.raw('Binds'),
		key: 'focusing',
		format: formatNumberVar,
		description: localized.raw('Number of times healing was started.'),
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	}),
	...aggregationVariableInfo({
		name: localized.concat(localized.silk('UI.INV_NAME_COIN'), localized.raw(' | earned')),
		key: 'geoEarned',
		format: formatNumberVar,
		description: localized.raw('Does not include Rosaries earned by collecting the corpse.'),
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	}),
	...aggregationVariableInfo({
		name: localized.concat(localized.silk('UI.INV_NAME_COIN'), localized.raw(' | spent')),
		key: 'geoSpent',
		format: formatNumberVar,
		description: localized.raw('Does not include Rosaries lost by dying and not collecting the corpse.'),
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	}),
	...aggregationVariableInfo({
		name: localized.concat(localized.silk('UI.INV_NAME_SHARD'), localized.raw(' | earned')),
		key: 'shellShardsEarned',
		format: formatNumberVar,
		description: localized.raw('Number of shell shards earned.'),
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	}),
	...aggregationVariableInfo({
		name: localized.concat(localized.silk('UI.INV_NAME_SHARD'), localized.raw(' | spent')),
		key: 'shellShardsSpent',
		format: formatNumberVar,
		description: localized.raw('Number of shell shards spent.'),
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	}),
};
