import { cn } from '@/lib/utils';
import Image from 'next/image';
import blueMaskImg from '../../../../../public/ingame-sprites/hud/edited/blueMask.png';
import emptyMaskImg from '../../../../../public/ingame-sprites/hud/edited/emptyMask.png';
import maskImg from '../../../../../public/ingame-sprites/hud/select_game_HUD_0001_health.png';
import steelMaskImg from '../../../../../public/ingame-sprites/hud/select_game_HUD_0001_health_steel.png';
import { type UseViewOptionsStore } from '../_viewOptionsStore';
import { tailwindChartColors } from './colors';
import { LineAreaChart, type LineChartVariableDescription } from './line-area-chart';

function MaskUnit({
    className,
    useViewOptionsStore,
}: {
    className?: string;
    useViewOptionsStore: UseViewOptionsStore;
}) {
    const isSteelSoul = useViewOptionsStore((s) => s.isSteelSoul);
    return <Image src={isSteelSoul ? steelMaskImg : maskImg} className={className} alt="Mask" />;
}

function LifebloodUnit({ className }: { className?: string }) {
    return <Image src={blueMaskImg} className={cn(className, '-mx-1 w-7')} alt="Lifeblood" />;
}
function EmptyMaskUnit({ className }: { className?: string }) {
    return <Image src={emptyMaskImg} className={className} alt="Empty mask" />;
}

const variables: LineChartVariableDescription[] = [
    {
        key: 'health',
        name: 'Masks',
        description: 'The players health',
        classNames: tailwindChartColors.slate,
        UnitIcon: MaskUnit,
        order: 1,
    },
    {
        key: 'healthBlue',
        name: 'Lifeblood masks',
        description: 'The players additional health from lifeblood masks',
        classNames: tailwindChartColors.sky,
        UnitIcon: LifebloodUnit,
        order: 2,
    },
    {
        key: 'healthLost',
        name: 'Empty masks',
        description: 'The currently empty masks, which can be healed back up',
        classNames: tailwindChartColors.light,
        UnitIcon: EmptyMaskUnit,
        order: 3,
        defaultHidden: true,
    },
];

export interface HealthChartProps {
    useViewOptionsStore: UseViewOptionsStore;
}
export function HealthChart({ useViewOptionsStore }: HealthChartProps) {
    return (
        <LineAreaChart
            useViewOptionsStore={useViewOptionsStore}
            variables={variables}
            header={
                <>
                    <MaskUnit className="mr-1 inline-block w-6" useViewOptionsStore={useViewOptionsStore} />
                    Health over time
                </>
            }
            yAxisLabel="Masks"
            minimalMaximumY={5}
            downScaleMaxTimeDelta={100}
        />
    );
}
