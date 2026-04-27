import { tailwindChartColors } from '../../colors';
import { LayoutPanelTypeProps } from '../../layout/layout-panel-props';
import { localized } from '../../store/localization-store';
import { LineChartVariableDescription } from '../area-charts-shared/area-chart-variable';
import { ChartDocTitleIcon, ChartDocVars } from '../area-charts-shared/chart-doc';
import { LineAreaChartPanel } from '../area-charts-shared/line-area-chart-panel';
import { GeoChartUnitIconHollow } from '../chart-icons';

const variables: LineChartVariableDescription[] = [
	{
		game: 'hollow',
		key: 'geo',
		name: localized.raw('Inventory Geo'),
		description: 'Geo the player has. Upon death, it will be transferred to the shade.',
		color: tailwindChartColors.emerald,
		UnitIcon: GeoChartUnitIconHollow,
		order: 3,
		display: 'default-shown',
	},
	{
		game: 'hollow',
		key: 'geoPool',
		name: localized.raw('Shade Geo'),
		description: 'The Geo the shade has, which can be earned back by defeating the shade.',
		color: tailwindChartColors.indigo,
		UnitIcon: GeoChartUnitIconHollow,
		order: 2,
		display: 'default-shown',
	},
	{
		game: 'hollow',
		key: 'trinketGeo',
		name: localized.raw('Relict Geo worth'),
		description: 'The Geo worth of all relicts in the inventory when sold to Lemm.',
		color: tailwindChartColors.rose,
		UnitIcon: GeoChartUnitIconHollow,
		order: 1,
		display: 'default-shown',
	},
	{
		game: 'hollow',
		key: 'geoTotal',
		name: localized.raw('Total'),
		description:
			'The total of the variables above. I.e. Geo the player would have if the shade is defeated and all relicts are sold.',
		color: tailwindChartColors.slate,
		UnitIcon: GeoChartUnitIconHollow,
		order: 1,
		display: 'never',
	},
];

export function GeoChartHollow(props: LayoutPanelTypeProps) {
	return (
		<LineAreaChartPanel
			variables={variables}
			yAxisLabel={localized.raw('Geo')}
			minimalMaximumY={100}
			downScaleMaxTimeDelta={10000}
			renderScale={100}
			{...props}
		/>
	);
}

export function GeoChartDocVarsHollow() {
	return <ChartDocVars variables={variables} />;
}

export function GeoChartDocIconHollow() {
	return <ChartDocTitleIcon unit={GeoChartUnitIconHollow} />;
}
