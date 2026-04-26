import { tailwindChartColors } from '../../colors';
import { LayoutPanelTypeProps } from '../../layout/layout-panel-props';
import { ChartDocTitleIcon, ChartDocVars } from '../area-charts-shared/chart-doc';
import { type LineChartVariableDescription } from '../area-charts-shared/line-area-chart';
import { LineAreaChartPanel } from '../area-charts-shared/line-area-chart-panel';
import {
	EmptyMaskUnit as EmptyMaskUnitIcon,
	HealthChartMaskUnitIcon,
	LifebloodUnit as LifebloodUnitIcon,
} from '../chart-icons';

const variables: LineChartVariableDescription[] = [
	{
		key: 'health',
		name: 'Masks',
		description: 'The players health.',
		color: tailwindChartColors.slate,
		UnitIcon: HealthChartMaskUnitIcon,
		order: 1,
	},
	{
		key: 'healthBlue',
		name: 'Lifeblood masks',
		description: 'The players additional health from lifeblood masks.',
		color: tailwindChartColors.sky,
		UnitIcon: LifebloodUnitIcon,
		order: 2,
	},
	{
		key: 'healthLost',
		name: 'Empty masks',
		description: 'The currently empty masks, which can be healed back up.',
		color: tailwindChartColors.light,
		UnitIcon: EmptyMaskUnitIcon,
		order: 3,
		defaultHidden: true,
	},
];

export function HealthChart(props: LayoutPanelTypeProps) {
	return (
		<LineAreaChartPanel
			variables={variables}
			icon={<HealthChartMaskUnitIcon class="mr-1 inline-block w-6" />}
			header="Health"
			yAxisLabel="Masks"
			minimalMaximumY={5}
			downScaleMaxTimeDelta={100}
			{...props}
		/>
	);
}

export function HealthChartDocVars() {
	return <ChartDocVars variables={variables} />;
}

export function HealthChartDocIcon() {
	return <ChartDocTitleIcon unit={HealthChartMaskUnitIcon} />;
}
