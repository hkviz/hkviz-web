import { type UseViewOptionsStore } from '../_viewOptionsStore';
import { tailwindChartColors } from './colors';
import { LineAreaChart, type LineChartVariableDescription } from './line-area-chart';

function Unit({ className }: { className?: string }) {
    return <span className={className}>%</span>;
}
const variables: LineChartVariableDescription[] = [
    {
        key: 'completionPercentageEarlyCalc',
        name: 'Game completion',
        description: 'Percentage of the game completed',
        classNames: tailwindChartColors.rose,
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

export interface CompletionChartProps {
    useViewOptionsStore: UseViewOptionsStore;
}
export function CompletionChart({ useViewOptionsStore }: CompletionChartProps) {
    return (
        <LineAreaChart
            useViewOptionsStore={useViewOptionsStore}
            variables={variables}
            header={
                <>
                    <Unit className="mr-1 inline-block w-6" />
                    Game completion
                </>
            }
            yAxisLabel="%"
            minimalMaximumY={100}
            downScaleMaxTimeDelta={100}
        />
    );
}
