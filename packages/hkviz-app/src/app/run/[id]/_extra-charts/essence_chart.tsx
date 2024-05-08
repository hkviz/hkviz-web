import { cn } from '@/lib/utils';
import Image from 'next/image';
import DreamNailImg from '../../../../../public/ingame-sprites/inventory/dream_nail_0003_1.png';
import { ChartDocTitleIcon, ChartDocVars } from './chart_doc';
import { tailwindChartColors } from './colors';
import { LineAreaChart, type LineChartVariableDescription } from './line-area-chart';

function Unit({ className }: { className?: string }) {
    return <Image src={DreamNailImg} className={cn('drop-shadow-glow-sm', className)} alt="Dream nail" />;
}
// function Unit({ className }: { className?: string }) {
//     return <span className={className}>%</span>;
// }
const variables: LineChartVariableDescription[] = [
    {
        key: 'dreamOrbs',
        name: 'Essence',
        description: 'Essence collected',
        color: tailwindChartColors.orange,
        UnitIcon: Unit,
        order: 1,
    },
];

export function EssenceChart() {
    return (
        <LineAreaChart
            variables={variables}
            header={
                <>
                    <Unit className="mr-1 inline-block w-6" />
                    Essence
                </>
            }
            yAxisLabel="Essence"
            minimalMaximumY={10}
            downScaleMaxTimeDelta={100}
        />
    );
}

export function CompletionChartDocVars() {
    return <ChartDocVars variables={variables} />;
}

export function CompletionChartDocIcon() {
    return <ChartDocTitleIcon unit={Unit} />;
}
