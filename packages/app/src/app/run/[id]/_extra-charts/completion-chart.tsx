import { tailwindChartColors } from '@hkviz/viz';
import { BadgePercent } from 'lucide-react';
import { ChartDocTitleIcon, ChartDocVars } from './chart_doc';
import { LineAreaChart, type LineChartVariableDescription } from './line-area-chart';

function Unit({ className }: { className?: string }) {
    return <BadgePercent className={className} />;
}
// function Unit({ className }: { className?: string }) {
//     return <span className={className}>%</span>;
// }
const variables: LineChartVariableDescription[] = [
    {
        key: 'completionPercentageEarlyCalc',
        name: 'Game completion',
        description: 'Percentage of the game completed.',
        color: tailwindChartColors.rose,
        UnitIcon: Unit,
        order: 1,
    },
    // {
    //     key: 'completionPercentage',
    //     name: 'Game completion x',
    //     description: 'Percentage of the game completed',
    //     classNames: lineAreaColors.slate,
    //     UnitIcon: Unit,
    //     order: 1,
    // },
];

export function CompletionChart() {
    return (
        <LineAreaChart
            variables={variables}
            header={
                <>
                    <Unit className="mr-1 inline-block w-6" />
                    Game completion
                </>
            }
            yAxisLabel="%"
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
