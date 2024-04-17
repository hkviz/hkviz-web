import { cn } from '@/lib/utils';
import Image from 'next/image';
import { gameplayStore } from '~/lib/stores/gameplay-store';
import blueMaskImg from '../../../../../public/ingame-sprites/hud/edited/blueMask.png';
import emptyMaskImg from '../../../../../public/ingame-sprites/hud/edited/emptyMask.png';
import maskImg from '../../../../../public/ingame-sprites/hud/select_game_HUD_0001_health.png';
import steelMaskImg from '../../../../../public/ingame-sprites/hud/select_game_HUD_0001_health_steel.png';
import { type UseViewOptionsStore } from '../../../../lib/stores/view-options-store';
import { ChartDocTitleIcon, ChartDocVars } from './chart_doc';
import { tailwindChartColors } from './colors';
import { LineAreaChart, type LineChartVariableDescription } from './line-area-chart';

function MaskUnit({ className }: { className?: string }) {
    const isSteelSoul = gameplayStore.isSteelSoul.value;
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
        description: 'The players health.',
        color: tailwindChartColors.slate,
        UnitIcon: MaskUnit,
        order: 1,
    },
    {
        key: 'healthBlue',
        name: 'Lifeblood masks',
        description: 'The players additional health from lifeblood masks.',
        color: tailwindChartColors.sky,
        UnitIcon: LifebloodUnit,
        order: 2,
    },
    {
        key: 'healthLost',
        name: 'Empty masks',
        description: 'The currently empty masks, which can be healed back up.',
        color: tailwindChartColors.light,
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
                    <MaskUnit className="mr-1 inline-block w-6" />
                    Health
                </>
            }
            yAxisLabel="Masks"
            minimalMaximumY={5}
            downScaleMaxTimeDelta={100}
        />
    );
}

export function HealthChartDocVars() {
    return <ChartDocVars variables={variables} />;
}

export function HealthChartDocIcon() {
    return <ChartDocTitleIcon unit={MaskUnit} />;
}
