import { tailwindChartColors } from '../../colors';
import { LayoutPanelTypeProps } from '../../layout/layout-panel-props';
import { ChartDocTitleIcon, ChartDocVars } from '../area-charts-shared/chart-doc';
import { type LineChartVariableDescription } from '../area-charts-shared/line-area-chart';
import { LineAreaChartPanel } from '../area-charts-shared/line-area-chart-panel';
import { SoulChartUnitIcon } from '../chart-icons';

const variables: LineChartVariableDescription[] = [
	{
		key: 'MPCharge',
		name: 'Soul',
		description: 'How much soul is in the soul meter (from 0 to 99). Healing and spells use 33 soul per use.',
		color: tailwindChartColors.slate,
		UnitIcon: SoulChartUnitIcon,
		order: 1,
	},
	{
		key: 'MPReserve',
		name: 'Soul reserve',
		description: 'Soul inside the soul vessels (up to 33 per vessel).',
		color: tailwindChartColors.indigo,
		UnitIcon: SoulChartUnitIcon,
		order: 2,
	},
	{
		key: 'MPTotal',
		name: 'Total',
		description: 'Total soul in soul meter and reserve.',
		color: tailwindChartColors.slate,
		UnitIcon: SoulChartUnitIcon,
		order: 3,
		notShownInGraph: true,
	},
];

export function SoulChart(props: LayoutPanelTypeProps) {
	return (
		<LineAreaChartPanel
			variables={variables}
			icon={<SoulChartUnitIcon class="mr-1 inline-block w-6" />}
			header="Soul"
			yAxisLabel="Soul"
			minimalMaximumY={99}
			downScaleMaxTimeDelta={100}
			{...props}
		/>
	);
}

export function SoulChartDocVars() {
	return <ChartDocVars variables={variables} />;
}

export function SoulChartDocIcon() {
	return <ChartDocTitleIcon unit={SoulChartUnitIcon} />;
}
