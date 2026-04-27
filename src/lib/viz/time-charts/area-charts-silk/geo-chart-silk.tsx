import { tailwindChartColors } from '../../colors';
import { LayoutPanelTypeProps } from '../../layout/layout-panel-props';
import { localized } from '../../store/localization-store';
import { LineChartVariableDescription } from '../area-charts-shared/area-chart-variable';
import { ChartDocTitleIcon, ChartDocVars } from '../area-charts-shared/chart-doc';
import { LineAreaChartPanel } from '../area-charts-shared/line-area-chart-panel';
import {
	CocoonUnitIconSilk,
	CrawbellChartUnitIconSilk,
	RelicUnitIconSilk,
	RosariesChartUnitIconSilk,
	RosaryChartUnitIconSilk,
	RosaryStringUnitIconSilk,
} from '../chart-icons';

const variables: LineChartVariableDescription[] = [
	{
		game: 'silk',
		key: 'geo',
		name: localized.silk('UI.INV_NAME_COIN'),
		description: 'Rosaries the player has. Upon death, it will be transferred to the cocoon.',
		color: tailwindChartColors.red,
		UnitIcon: RosaryChartUnitIconSilk,
		order: 6,
		display: 'default-shown',
	},
	{
		game: 'silk',
		key: 'HeroCorpseMoneyPool',
		name: localized.raw('Cocoon Rosaries'),
		description: 'The Rosaries the cocoon has, which can be earned back by defeating the cocoon.',
		color: tailwindChartColors.indigo,
		UnitIcon: CocoonUnitIconSilk,
		order: 5,
		display: 'default-shown',
	},
	/*{
		game: 'silk',
		key: 'trinketGeo',
		name: localized.raw('Relict Geo worth'),
		description: 'The Geo worth of all relicts in the inventory when sold to Lemm.',
		color: tailwindChartColors.rose,
		UnitIcon: RosaryChartUnitIconSilk,
		order: 1,
		display: 'default-shown',
	},*/
	{
		game: 'silk',
		key: 'collectableGeo',
		name: localized.concat(localized.silk('UI.INV_NAME_COIN_SET_S'), localized.raw(' & co.')),
		description: 'The worth of all inventory items when converted to Rosaries.',
		color: tailwindChartColors.orange,
		UnitIcon: RosaryStringUnitIconSilk,
		order: 4,
		display: 'default-shown',
	},
	{
		game: 'silk',
		key: 'crawbellCurrencyGeo',
		name: localized.silk('UI.INV_NAME_CRAWBELL'),
		description: 'The amount of Rosaries in the Crawbell at the Bellhome.',
		color: tailwindChartColors.amberLight,
		UnitIcon: CrawbellChartUnitIconSilk,
		order: 3,
		display: 'default-shown',
	},
	{
		game: 'silk',
		key: 'relicGeo',
		name: localized.silk('UI.COLLECTION_HEADING_RELICDEALER'),
		description:
			'The reward for relics currently in the inventory. I.e. already collected, but not given to Relic Seeker Scrounge.',
		color: tailwindChartColors.emerald,
		UnitIcon: RelicUnitIconSilk,
		order: 2,
		display: 'default-shown',
	},
	{
		game: 'silk',
		key: 'geoTotal',
		name: localized.raw('Total'),
		description: 'The total of the variables above.',
		color: tailwindChartColors.slate,
		UnitIcon: RosariesChartUnitIconSilk,
		order: 1,
		display: 'never',
	},
];

export function GeoChartSilk(props: LayoutPanelTypeProps) {
	return (
		<LineAreaChartPanel
			variables={variables}
			yAxisLabel={localized.silk('UI.INV_NAME_COIN')}
			minimalMaximumY={100}
			downScaleMaxTimeDelta={10000}
			renderScale={100}
			{...props}
		/>
	);
}

export function GeoChartDocVarsSilk() {
	return <ChartDocVars variables={variables} />;
}

export function GeoChartDocIconSilk() {
	return <ChartDocTitleIcon unit={RosaryChartUnitIconSilk} />;
}
