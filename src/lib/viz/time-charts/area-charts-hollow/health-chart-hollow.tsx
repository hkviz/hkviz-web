import { tailwindChartColors } from '../../colors';
import { LayoutPanelTypeProps } from '../../layout/layout-panel-props';
import { localized } from '../../store/localization-store';
import { LineChartVariableDescription } from '../area-charts-shared/area-chart-variable';
import { ChartDocTitleIcon, ChartDocVars } from '../area-charts-shared/chart-doc';
import { LineAreaChartPanel } from '../area-charts-shared/line-area-chart-panel';
import {
	EmptyMaskUnitHollow as EmptyMaskUnitIcon,
	HealthChartMaskUnitIconHollow,
	LifebloodUnitHollow as LifebloodUnitIcon,
} from '../chart-icons';

const variables: LineChartVariableDescription[] = [
	{
		game: 'hollow',
		key: 'health',
		name: localized.raw('Masks'),
		description: 'The players health.',
		color: tailwindChartColors.slate,
		UnitIcon: HealthChartMaskUnitIconHollow,
		order: 1,
		display: 'default-shown',
	},
	{
		game: 'hollow',
		key: 'healthBlue',
		name: localized.raw('Lifeblood masks'),
		description: 'The players additional health from lifeblood masks.',
		color: tailwindChartColors.sky,
		UnitIcon: LifebloodUnitIcon,
		order: 2,
		display: 'default-shown',
	},
	{
		game: 'hollow',
		key: 'healthLost',
		name: localized.raw('Empty masks'),
		description: 'The currently empty masks, which can be healed back up.',
		color: tailwindChartColors.light,
		UnitIcon: EmptyMaskUnitIcon,
		order: 3,
		display: 'default-hidden',
	},
];

export function HealthChartHollow(props: LayoutPanelTypeProps) {
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

export function HealthChartDocVarsHollow() {
	return <ChartDocVars variables={variables} />;
}

export function HealthChartDocIconHollow() {
	return <ChartDocTitleIcon unit={HealthChartMaskUnitIconHollow} />;
}
