import { tailwindChartColors } from '../colors';
import { LayoutPanelTypeProps } from '../layout/layout-panel-props';
import { ChartDocTitleIcon, ChartDocVars } from './chart-doc';
import { GeoChartUnitIcon } from './chart-icons';
import { type LineChartVariableDescription } from './line-area-chart';
import { LineAreaChartPanel } from './line-area-chart-panel';

const variables: LineChartVariableDescription[] = [
	{
		key: 'geo',
		name: 'Inventory Geo',
		description: 'Geo the player has. When dying, it will be transferred to the shade.',
		color: tailwindChartColors.emerald,
		UnitIcon: GeoChartUnitIcon,
		order: 3,
	},
	{
		key: 'geoPool',
		name: 'Shade Geo',
		description: 'The Geo the shade has, which can be earned back by defeating the shade.',
		color: tailwindChartColors.indigo,
		UnitIcon: GeoChartUnitIcon,
		order: 2,
	},
	{
		key: 'trinketGeo',
		name: 'Relict Geo worth',
		description: 'The Geo worth of all relicts in the inventory when sold to Lemm.',
		color: tailwindChartColors.rose,
		UnitIcon: GeoChartUnitIcon,
		order: 1,
	},
	{
		key: 'geoTotal',
		name: 'Total',
		description:
			'The total of the variables above. I.e. Geo the player would have if the shade is defeated and all relicts are sold.',
		color: tailwindChartColors.slate,
		UnitIcon: GeoChartUnitIcon,
		order: 1,
		notShownInGraph: true,
	},
];

export function GeoChart(props: LayoutPanelTypeProps) {
	return (
		<LineAreaChartPanel
			variables={variables}
			icon={<GeoChartUnitIcon class="mr-1 inline-block w-6" />}
			header="Geo"
			yAxisLabel="Geo"
			minimalMaximumY={100}
			downScaleMaxTimeDelta={10000}
			renderScale={100}
			{...props}
		/>
	);
}

export function GeoChartDocVars() {
	return <ChartDocVars variables={variables} />;
}

export function GeoChartDocIcon() {
	return <ChartDocTitleIcon unit={GeoChartUnitIcon} />;
}
