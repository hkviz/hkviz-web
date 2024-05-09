import Image from 'next/image';
import vesselImg from '../../../../../public/ingame-sprites/hud/select_game_HUD_0000_magic_orb.png';
import { ChartDocTitleIcon, ChartDocVars } from './chart_doc';
import { tailwindChartColors } from '@hkviz/viz';
import { LineAreaChart, type LineChartVariableDescription } from './line-area-chart';

function Unit({ className }: { className?: string }) {
    return <Image src={vesselImg} className={className} alt="Soul" />;
}

const variables: LineChartVariableDescription[] = [
    {
        key: 'MPCharge',
        name: 'Soul',
        description: 'How much soul is in the soul meter (from 0 to 99). Healing and spells use 33 soul per use.',
        color: tailwindChartColors.slate,
        UnitIcon: Unit,
        order: 1,
    },
    {
        key: 'MPReserve',
        name: 'Soul reserve',
        description: 'Soul inside the soul vessels (up to 33 per vessel).',
        color: tailwindChartColors.indigo,
        UnitIcon: Unit,
        order: 2,
    },
    {
        key: 'MPTotal',
        name: 'Total',
        description: 'Total soul in soul meter and reserve.',
        color: tailwindChartColors.slate,
        UnitIcon: Unit,
        order: 3,
        notShownInGraph: true,
    },
];

export function SoulChart() {
    return (
        <LineAreaChart
            variables={variables}
            header={
                <>
                    <Unit className="mr-1 inline-block w-6" />
                    Soul
                </>
            }
            yAxisLabel="Soul"
            minimalMaximumY={99}
            downScaleMaxTimeDelta={100}
        />
    );
}

export function SoulChartDocVars() {
    return <ChartDocVars variables={variables} />;
}

export function SoulChartDocIcon() {
    return <ChartDocTitleIcon unit={Unit} />;
}
