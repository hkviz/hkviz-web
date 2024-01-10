import { cn } from '@/lib/utils';
import Image from 'next/image';
import coinImg from '../../../../../public/ingame-sprites/HUD_coin_shop.png';
import { type UseViewOptionsStore } from '../_viewOptionsStore';
import { LineAreaChart, type LineChartVariableDescription } from './line-area-chart';

const Unit = ({ className }: { className?: string }) => (
    <Image src={coinImg} className={cn('inline-block h-auto w-4', className)} alt="Geo" />
);

const variables: LineChartVariableDescription[] = [
    {
        key: 'geo',
        name: 'Geo',
        description: 'Geo the player has',
        checkboxClassName: 'data-[state=checked]:bg-emerald-500 border-emerald-500 outline-emerald-500',
        pathClassName: 'text-emerald-500 fill-current',
        UnitIcon: Unit,
        order: 3,
    },
    {
        key: 'geoPool',
        name: 'Shade Geo',
        description: 'The geo the shade has, which can be earned back by defeating the shade.',
        checkboxClassName: 'data-[state=checked]:bg-indigo-500 border-indigo-500 outline-indigo-500',
        pathClassName: 'text-indigo-500 fill-current',
        UnitIcon: Unit,
        order: 2,
    },
    {
        key: 'trinketGeo',
        name: 'Relict Geo worth',
        description: 'The geo which the relicts in the inventory are worth when sold to Lemm.',
        checkboxClassName: 'data-[state=checked]:bg-rose-500 border-rose-500 outline-rose-500',
        pathClassName: 'text-rose-500 fill-current',
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
        />
    );
}
