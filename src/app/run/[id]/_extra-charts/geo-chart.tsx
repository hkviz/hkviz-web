import Image from 'next/image';
import coinImg from '../../../../../public/ingame-sprites/HUD_coin_shop.png';
import { type UseViewOptionsStore } from '../_viewOptionsStore';
import { lineAreaColors } from './colors';
import { LineAreaChart, type LineChartVariableDescription } from './line-area-chart';

const Unit = ({ className }: { className?: string }) => (
    <Image src={coinImg} className={className} alt="Geo" />
);

const variables: LineChartVariableDescription[] = [
    {
        key: 'geo',
        name: 'Geo',
        description: 'Geo the player has',
        classNames: lineAreaColors.emerald,
        UnitIcon: Unit,
        order: 3,
    },
    {
        key: 'geoPool',
        name: 'Shade Geo',
        description: 'The geo the shade has, which can be earned back by defeating the shade.',
        classNames: lineAreaColors.indigo,
        UnitIcon: Unit,
        order: 2,
    },
    {
        key: 'trinketGeo',
        name: 'Relict Geo worth',
        description: 'The geo which the relicts in the inventory are worth when sold to Lemm.',
        classNames: lineAreaColors.rose,
        UnitIcon: Unit,
        order: 1,
    },
];

export interface GeoChartProps {
    useViewOptionsStore: UseViewOptionsStore;
}
export function GeoChart({ useViewOptionsStore }: GeoChartProps) {
    return (
        <LineAreaChart
            useViewOptionsStore={useViewOptionsStore}
            variables={variables}
            header={
                <>
                    <Unit className="mr-1 inline-block w-6" />
                    Geo over time
                </>
            }
            yAxisLabel="Geo"
            minimalMaximumY={100}
            downScaleMaxTimeDelta={10000}
        />
    );
}
