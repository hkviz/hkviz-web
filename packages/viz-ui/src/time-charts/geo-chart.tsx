import { tailwindChartColors } from '@hkviz/viz';
import { ChartDocTitleIcon, ChartDocVars } from './chart-doc';
import { LineAreaChart, type LineChartVariableDescription } from './line-area-chart';
import { coinImg } from '../img-urls';
import { type Component } from 'solid-js';

const Unit: Component<{ class?: string }> = (props) => {
    return <img src={coinImg} class={props.class} alt="Geo" />;
};

const variables: LineChartVariableDescription[] = [
    {
        key: 'geo',
        name: 'Inventory Geo',
        description: 'Geo the player has. When dying in Hollow Knight, it will be transferred to the shade.',
        color: tailwindChartColors.emerald,
        UnitIcon: Unit,
        order: 3,
    },
    {
        key: 'geoPool',
        name: 'Shade Geo',
        description: 'The geo the shade has, which can be earned back by defeating the shade.',
        color: tailwindChartColors.indigo,
        UnitIcon: Unit,
        order: 2,
    },
    {
        key: 'trinketGeo',
        name: 'Relict Geo worth',
        description: 'The geo worth of all relicts in the inventory when sold to Lemm.',
        color: tailwindChartColors.rose,
        UnitIcon: Unit,
        order: 1,
    },
    {
        key: 'geoTotal',
        name: 'Total',
        description:
            'The total of the variables above. I.e. Geo the player would have if the shade is defeated and all relicts are sold.',
        color: tailwindChartColors.slate,
        UnitIcon: Unit,
        order: 1,
        notShownInGraph: true,
    },
];

export function GeoChart() {
    return (
        <LineAreaChart
            variables={variables}
            header={
                <>
                    <Unit class="mr-1 inline-block w-6" />
                    Geo
                </>
            }
            yAxisLabel="Geo"
            minimalMaximumY={100}
            downScaleMaxTimeDelta={10000}
            renderScale={100}
        />
    );
}

export function GeoChartDocVars() {
    return <ChartDocVars variables={variables} />;
}

export function GeoChartDocIcon() {
    return <ChartDocTitleIcon unit={Unit} />;
}
