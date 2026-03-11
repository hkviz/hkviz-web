import { tailwindChartColors } from '../colors';
import { LayoutPanelTypeProps } from '../layout/layout-panel-props';
import { ChartDocTitleIcon, ChartDocVars } from './chart-doc';
import { EssenceChartUnitIcon } from './chart-icons';
import { type LineChartVariableDescription } from './line-area-chart';
import { LineAreaChartPanel } from './line-area-chart-panel';

const variables: LineChartVariableDescription[] = [
	{
		key: 'dreamOrbs',
		name: 'Essence',
		description: 'Essence collected',
		color: tailwindChartColors.orange,
		UnitIcon: EssenceChartUnitIcon,
		order: 1,
	},
];

export function EssenceChart(props: LayoutPanelTypeProps) {
	return (
		<LineAreaChartPanel
			variables={variables}
			icon={<EssenceChartUnitIcon class="mr-1 inline-block w-6" />}
			header="Essence"
			yAxisLabel="Essence"
			minimalMaximumY={10}
			downScaleMaxTimeDelta={100}
			{...props}
		/>
	);
}

export function EssenceChartDocVars() {
	return <ChartDocVars variables={variables} />;
}

export function EssenceChartDocIcon() {
	return <ChartDocTitleIcon unit={EssenceChartUnitIcon} />;
}
