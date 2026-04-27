import { tailwindChartColors } from '../../colors';
import { LayoutPanelTypeProps } from '../../layout/layout-panel-props';
import { localized } from '../../store/localization-store';
import { LineChartVariableDescription } from '../area-charts-shared/area-chart-variable';
import { ChartDocTitleIcon, ChartDocVars } from '../area-charts-shared/chart-doc';
import { LineAreaChartPanel } from '../area-charts-shared/line-area-chart-panel';
import {
	CrawbellChartUnitIconSilk,
	RosaryChartUnitIconSilk,
	ShellShardBundleUnitIconSilk,
	ShellShardUnitIconSilk,
} from '../chart-icons';

const variables: LineChartVariableDescription[] = [
	{
		game: 'silk',
		key: 'ShellShards',
		name: localized.silk('UI.INV_NAME_SHARD'),
		description: 'Shell Shards the player has.',
		color: tailwindChartColors.slate,
		UnitIcon: ShellShardUnitIconSilk,
		order: 4,
		display: 'default-shown',
	},
	{
		game: 'silk',
		key: 'collectableShellShards',
		name: localized.concat(localized.silk('UI.INV_NAME_SHARD_POUCH'), localized.raw(' & co.')),
		description: 'The worth of all inventory items when converted to Shell Shards.',
		color: tailwindChartColors.orange,
		UnitIcon: ShellShardBundleUnitIconSilk,
		order: 3,
		display: 'default-shown',
	},
	{
		game: 'silk',
		key: 'crawbellCurrencyShellShard',
		name: localized.silk('UI.INV_NAME_CRAWBELL'),
		description: 'The amount of Shell Shards in the Crawbell at the Bellhome.',
		color: tailwindChartColors.amberLight,
		UnitIcon: CrawbellChartUnitIconSilk,
		order: 2,
		display: 'default-shown',
	},
	{
		game: 'silk',
		key: 'shellShardTotal',
		name: localized.raw('Total'),
		description:
			'The total of the variables above. I.e. Shell Shards the player would have if all Shell Bundles and other items are broken.',
		color: tailwindChartColors.slate,
		UnitIcon: ShellShardUnitIconSilk,
		order: 1,
		display: 'never',
	},
];

export function ShellShardChartSilk(props: LayoutPanelTypeProps) {
	return (
		<LineAreaChartPanel
			variables={variables}
			yAxisLabel={localized.silk('UI.INV_NAME_SHARD')}
			minimalMaximumY={100}
			downScaleMaxTimeDelta={10000}
			renderScale={100}
			{...props}
		/>
	);
}

export function ShellShardChartDocVarsSilk() {
	return <ChartDocVars variables={variables} />;
}

export function ShellShardChartDocIconSilk() {
	return <ChartDocTitleIcon unit={RosaryChartUnitIconSilk} />;
}
