import { tailwindChartColors } from '../../colors';
import { LayoutPanelTypeProps } from '../../layout/layout-panel-props';
import { localized } from '../../store/localization-store';
import { LineChartVariableDescription } from '../area-charts-shared/area-chart-variable';
import { ChartDocTitleIcon, ChartDocVars } from '../area-charts-shared/chart-doc';
import { LineAreaChartPanel } from '../area-charts-shared/line-area-chart-panel';
import { CompletionChartUnitIcon } from '../chart-icons';

const variables: LineChartVariableDescription[] = [
	{
		game: 'hollow',
		key: 'completionPercentageEarlyCalc',
		name: localized.raw('Game completion'),
		description: 'Percentage of the game completed.',
		color: tailwindChartColors.rose,
		UnitIcon: CompletionChartUnitIcon,
		order: 1,
		display: 'default-shown',
	},
	// {
	//     key: 'completionPercentage',
	//     name: localized.raw('Game completion x'),
	//     description: 'Percentage of the game completed',
	//     classNames: lineAreaColors.slate,
	//     UnitIcon: Unit,
	//     order: 1,
	// },
];

export function CompletionChartHollow(props: LayoutPanelTypeProps) {
	return (
		<LineAreaChartPanel
			variables={variables}
			yAxisLabel={localized.raw('%')}
			minimalMaximumY={10}
			downScaleMaxTimeDelta={100}
			{...props}
		/>
	);
}

export function CompletionChartDocVarsHollow() {
	return <ChartDocVars variables={variables} />;
}

export function CompletionChartDocIconHollow() {
	return <ChartDocTitleIcon unit={CompletionChartUnitIcon} />;
}
