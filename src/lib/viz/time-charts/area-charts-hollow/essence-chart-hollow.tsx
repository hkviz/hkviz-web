import { tailwindChartColors } from '../../colors';
import { LayoutPanelTypeProps } from '../../layout/layout-panel-props';
import { localized } from '../../store/localization-store';
import { LineChartVariableDescription } from '../area-charts-shared/area-chart-variable';
import { ChartDocTitleIcon, ChartDocVars } from '../area-charts-shared/chart-doc';
import { LineAreaChartPanel } from '../area-charts-shared/line-area-chart-panel';
import { EssenceChartUnitIconHollow } from '../chart-icons';

const variables: LineChartVariableDescription[] = [
	{
		game: 'hollow',
		key: 'dreamOrbs',
		name: localized.raw('Essence'),
		description: 'Essence collected',
		color: tailwindChartColors.orange,
		UnitIcon: EssenceChartUnitIconHollow,
		order: 1,
		display: 'default-shown',
	},
];

export function EssenceChartHollow(props: LayoutPanelTypeProps) {
	return (
		<LineAreaChartPanel
			variables={variables}
			yAxisLabel={localized.raw('Essence')}
			minimalMaximumY={10}
			downScaleMaxTimeDelta={100}
			{...props}
		/>
	);
}

export function EssenceChartDocVarsHollow() {
	return <ChartDocVars variables={variables} />;
}

export function EssenceChartDocIconHollow() {
	return <ChartDocTitleIcon unit={EssenceChartUnitIconHollow} />;
}
