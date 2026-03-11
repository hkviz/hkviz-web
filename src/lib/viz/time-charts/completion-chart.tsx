import { tailwindChartColors } from '../colors';
import { LayoutPanelTypeProps } from '../layout/layout-panel-props';
import { ChartDocTitleIcon, ChartDocVars } from './chart-doc';
import { CompletionChartUnitIcon } from './chart-icons';
import { type LineChartVariableDescription } from './line-area-chart';
import { LineAreaChartPanel } from './line-area-chart-panel';

const variables: LineChartVariableDescription[] = [
	{
		key: 'completionPercentageEarlyCalc',
		name: 'Game completion',
		description: 'Percentage of the game completed.',
		color: tailwindChartColors.rose,
		UnitIcon: CompletionChartUnitIcon,
		order: 1,
	},
	// {
	//     key: 'completionPercentage',
	//     name: 'Game completion x',
	//     description: 'Percentage of the game completed',
	//     classNames: lineAreaColors.slate,
	//     UnitIcon: Unit,
	//     order: 1,
	// },
];

export function CompletionChart(props: LayoutPanelTypeProps) {
	return (
		<LineAreaChartPanel
			variables={variables}
			icon={<CompletionChartUnitIcon class="mr-1 inline-block w-6" />}
			header="Game completion"
			yAxisLabel="%"
			minimalMaximumY={10}
			downScaleMaxTimeDelta={100}
			{...props}
		/>
	);
}

export function CompletionChartDocVars() {
	return <ChartDocVars variables={variables} />;
}

export function CompletionChartDocIcon() {
	return <ChartDocTitleIcon unit={CompletionChartUnitIcon} />;
}
