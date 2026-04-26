import { tailwindChartColors } from '../../colors';
import { LayoutPanelTypeProps } from '../../layout/layout-panel-props';
import { ChartDocTitleIcon, ChartDocVars } from '../area-charts-shared/chart-doc';
import { type LineChartVariableDescription } from '../area-charts-shared/line-area-chart';
import { LineAreaChartPanel } from '../area-charts-shared/line-area-chart-panel';
import { GrubChartUnitIcon } from '../chart-icons';

const variables: LineChartVariableDescription[] = [
	{
		key: 'grubsNoRewardCollected',
		name: 'Grubs freed, unrewarded',
		description:
			'These grubs have already been freed from their glass jars, going to the grub father will reward you for freeing them.',
		color: tailwindChartColors.amberLight,
		UnitIcon: GrubChartUnitIcon,
		order: 2,
	},
	{
		key: 'grubRewards',
		name: 'Grubs freed, reward collected',
		description:
			'These grubs have already been freed from their glass jars and the reward from grub father has been collected as well.',
		color: tailwindChartColors.green,
		UnitIcon: GrubChartUnitIcon,
		order: 1,
	},
	{
		key: 'grubsCollected',
		name: 'Total',
		description: 'Total number of grubs freed from their glass jars.',
		color: tailwindChartColors.slate,
		UnitIcon: GrubChartUnitIcon,
		order: 1,
		notShownInGraph: true,
	},
];

export function GrubChart(props: LayoutPanelTypeProps) {
	return (
		<LineAreaChartPanel
			variables={variables}
			icon={<GrubChartUnitIcon class="mr-1 inline-block w-6" />}
			header="Grubs"
			yAxisLabel="Grubs"
			minimalMaximumY={1}
			downScaleMaxTimeDelta={100}
			{...props}
		/>
	);
}

export function GrubsChartDocVars() {
	return <ChartDocVars variables={variables} />;
}

export function GrubsChartDocIcon() {
	return <ChartDocTitleIcon unit={GrubChartUnitIcon} />;
}
