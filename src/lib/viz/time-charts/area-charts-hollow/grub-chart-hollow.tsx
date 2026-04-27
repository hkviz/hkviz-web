import { tailwindChartColors } from '../../colors';
import { LayoutPanelTypeProps } from '../../layout/layout-panel-props';
import { localized } from '../../store/localization-store';
import { LineChartVariableDescription } from '../area-charts-shared/area-chart-variable';
import { ChartDocTitleIcon, ChartDocVars } from '../area-charts-shared/chart-doc';
import { LineAreaChartPanel } from '../area-charts-shared/line-area-chart-panel';
import { GrubChartUnitIconHollow } from '../chart-icons';

const variables: LineChartVariableDescription[] = [
	{
		game: 'hollow',
		key: 'grubsNoRewardCollected',
		name: localized.raw('Grubs freed, unrewarded'),
		description:
			'These grubs have already been freed from their glass jars, going to the grub father will reward you for freeing them.',
		color: tailwindChartColors.amberLight,
		UnitIcon: GrubChartUnitIconHollow,
		order: 2,
		display: 'default-shown',
	},
	{
		game: 'hollow',
		key: 'grubRewards',
		name: localized.raw('Grubs freed, reward collected'),
		description:
			'These grubs have already been freed from their glass jars and the reward from grub father has been collected as well.',
		color: tailwindChartColors.green,
		UnitIcon: GrubChartUnitIconHollow,
		order: 1,
		display: 'default-shown',
	},
	{
		game: 'hollow',
		key: 'grubsCollected',
		name: localized.raw('Total'),
		description: 'Total number of grubs freed from their glass jars.',
		color: tailwindChartColors.slate,
		UnitIcon: GrubChartUnitIconHollow,
		order: 1,
		display: 'never',
	},
];

export function GrubChartHollow(props: LayoutPanelTypeProps) {
	return (
		<LineAreaChartPanel
			variables={variables}
			yAxisLabel={localized.raw('Grubs')}
			minimalMaximumY={1}
			downScaleMaxTimeDelta={100}
			{...props}
		/>
	);
}

export function GrubsChartDocVarsHollow() {
	return <ChartDocVars variables={variables} />;
}

export function GrubsChartDocIconHollow() {
	return <ChartDocTitleIcon unit={GrubChartUnitIconHollow} />;
}
