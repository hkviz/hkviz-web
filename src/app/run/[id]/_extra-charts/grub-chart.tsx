import Image from 'next/image';
import grubImage from '../../../../../public/ingame-sprites/pin/pin_grub_location.png';
import { type UseViewOptionsStore } from '../_viewOptionsStore';
import { ChartDocTitleIcon, ChartDocVars } from './chart_doc';
import { tailwindChartColors } from './colors';
import { LineAreaChart, type LineChartVariableDescription } from './line-area-chart';

const Unit = ({ className }: { className?: string }) => <Image src={grubImage} className={className} alt="Geo" />;

const variables: LineChartVariableDescription[] = [
    {
        key: 'grubsNoRewardCollected',
        name: 'Grubs collected, reward not collected',
        description: 'Grubs collected, reward not collected.',
        color: tailwindChartColors.amberLight,
        UnitIcon: Unit,
        order: 2,
    },
    {
        key: 'grubRewards',
        name: 'Grubs collected, reward collected',
        description: 'Grubs collected, reward collected.',
        color: tailwindChartColors.green,
        UnitIcon: Unit,
        order: 1,
    },
    {
        key: 'grubsCollected',
        name: 'Total',
        description: 'Total number of grubs collected.',
        color: tailwindChartColors.slate,
        UnitIcon: Unit,
        order: 1,
        notShownInGraph: true,
    },
];

export interface GrubChartProps {
    useViewOptionsStore: UseViewOptionsStore;
}
export function GrubChart({ useViewOptionsStore }: GrubChartProps) {
    return (
        <LineAreaChart
            useViewOptionsStore={useViewOptionsStore}
            variables={variables}
            header={
                <>
                    <Unit className="mr-1 inline-block w-6" />
                    Grubs
                </>
            }
            yAxisLabel="Grubs"
            minimalMaximumY={1}
            downScaleMaxTimeDelta={100}
        />
    );
}

export function GrubsChartDocVars() {
    return <ChartDocVars variables={variables} />;
}

export function GrubsChartDocIcon() {
    return <ChartDocTitleIcon unit={Unit} />;
}
