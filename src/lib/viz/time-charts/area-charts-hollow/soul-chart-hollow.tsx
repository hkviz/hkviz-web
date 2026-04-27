import { tailwindChartColors } from '../../colors';
import { LayoutPanelTypeProps } from '../../layout/layout-panel-props';
import { localized } from '../../store/localization-store';
import { LineChartVariableDescription } from '../area-charts-shared/area-chart-variable';
import { ChartDocTitleIcon, ChartDocVars } from '../area-charts-shared/chart-doc';
import { LineAreaChartPanel } from '../area-charts-shared/line-area-chart-panel';
import { SoulChartUnitIconHollow } from '../chart-icons';

const variables: LineChartVariableDescription[] = [
	{
		game: 'hollow',
		key: 'MPCharge',
		name: localized.raw('Soul'),
		description: 'How much soul is in the soul meter (from 0 to 99). Healing and spells use 33 soul per use.',
		color: tailwindChartColors.slate,
		UnitIcon: SoulChartUnitIconHollow,
		order: 1,
		display: 'default-shown',
	},
	{
		game: 'hollow',
		key: 'MPReserve',
		name: localized.raw('Soul reserve'),
		description: 'Soul inside the soul vessels (up to 33 per vessel).',
		color: tailwindChartColors.indigo,
		UnitIcon: SoulChartUnitIconHollow,
		order: 2,
		display: 'default-shown',
	},
	{
		game: 'hollow',
		key: 'MPTotal',
		name: localized.raw('Total'),
		description: 'Total soul in soul meter and reserve.',
		color: tailwindChartColors.slate,
		UnitIcon: SoulChartUnitIconHollow,
		order: 3,
		display: 'never',
	},
];

export function SoulChartHollow(props: LayoutPanelTypeProps) {
	return (
		<LineAreaChartPanel
			variables={variables}
			yAxisLabel={localized.raw('Soul')}
			minimalMaximumY={99}
			downScaleMaxTimeDelta={100}
			{...props}
		/>
	);
}

export function SoulChartDocVarsHollow() {
	return <ChartDocVars variables={variables} />;
}

export function SoulChartDocIconHollow() {
	return <ChartDocTitleIcon unit={SoulChartUnitIconHollow} />;
}
