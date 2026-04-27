import { tailwindChartColors } from '../../colors';
import { LayoutPanelTypeProps } from '../../layout/layout-panel-props';
import { localized } from '../../store/localization-store';
import { LineChartVariableDescription } from '../area-charts-shared/area-chart-variable';
import { ChartDocTitleIcon, ChartDocVars } from '../area-charts-shared/chart-doc';
import { LineAreaChartPanel } from '../area-charts-shared/line-area-chart-panel';
import { HealthChartMaskUnitIconSilk, HealthEmptyChartMaskUnitIconSilk, LifebloodUnitSilk } from '../chart-icons';

const variables: LineChartVariableDescription[] = [
	{
		game: 'silk',
		key: 'health',
		name: localized.raw('Masks'),
		description: 'The players health.',
		color: tailwindChartColors.slate,
		UnitIcon: HealthChartMaskUnitIconSilk,
		order: 1,
		display: 'default-shown',
	},
	{
		game: 'silk',
		key: 'healthBlue',
		name: localized.silk('UI.MAT_NAME_LIFEBLOOD'),
		description: 'The players additional health from lifeblood masks.',
		color: tailwindChartColors.sky,
		UnitIcon: LifebloodUnitSilk,
		order: 2,
		display: 'default-shown',
	},
	{
		game: 'silk',
		key: 'healthLost',
		name: localized.raw('Empty masks'),
		description: 'The currently empty masks, which can be healed back up.',
		color: tailwindChartColors.light,
		UnitIcon: HealthEmptyChartMaskUnitIconSilk,
		order: 3,
		display: 'default-hidden',
	},
];

export function HealthChartSilk(props: LayoutPanelTypeProps) {
	return (
		<LineAreaChartPanel
			variables={variables}
			yAxisLabel={localized.raw('Masks')}
			minimalMaximumY={5}
			downScaleMaxTimeDelta={100}
			{...props}
		/>
	);
}

export function HealthChartDocVarsSilk() {
	return <ChartDocVars variables={variables} />;
}

export function HealthChartDocIconSilk() {
	return <ChartDocTitleIcon unit={HealthChartMaskUnitIconSilk} />;
}
