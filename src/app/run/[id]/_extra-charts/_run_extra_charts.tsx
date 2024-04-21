import { cardHeaderSmallClasses, cardTitleSmallClasses } from '@/components/additions/cards';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CommandShortcut } from '@/components/ui/command';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useSignals } from '@preact/signals-react/runtime';
import { useId, type ReactNode } from 'react';
import { extraChartStore } from '~/lib/stores/extra-chart-store';
import { uiStore } from '~/lib/stores/ui-store';
import { CompletionChart } from './completion-chart';
import { EssenceChart } from './essence_chart';
import { GeoChart } from './geo-chart';
import { GrubChart } from './grub-chart';
import { HealthChart } from './health-chart';
import { SoulChart } from './soul-chart';

function RunExtraChartsFollowCheckbox() {
    useSignals();
    const id = useId();
    const extraChartsFollowAnimation = extraChartStore.followsAnimation.value;
    return (
        <div className="flex flex-row gap-2 px-4 pb-2">
            <Checkbox
                id={id + 'follow_anim'}
                checked={extraChartsFollowAnimation}
                onCheckedChange={(c) => extraChartStore.setFollowsAnimationAutoBounds(c === true)}
            />
            <label
                htmlFor={id + 'follow_anim'}
                className="grow text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                Follow animation
            </label>
        </div>
    );
}

export interface RunExtraChartsProps {
    resizeOptions?: ReactNode;
}

export function RunExtraCharts({ resizeOptions }: RunExtraChartsProps) {
    useSignals();
    const isV1 = uiStore.isV1.value;

    const isMac = typeof window !== 'undefined' ? /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent) : false;
    return (
        <div className="flex h-full flex-col">
            <CardHeader className={cardHeaderSmallClasses}>
                <CardTitle className={cn(cardTitleSmallClasses, 'flex w-full flex-row justify-between')}>
                    Time-based charts
                    {resizeOptions}
                </CardTitle>
            </CardHeader>

            <RunExtraChartsFollowCheckbox />
            <hr />
            {/* snap-proximity */}
            <div className="shrink grow snap-y snap-mandatory overflow-y-auto lg:shrink lg:basis-0">
                {!isV1 && (
                    <div className="snap-start snap-normal">
                        <Table className="pb-2">
                            <TableBody>
                                <TableRow>
                                    <TableCell className="p-1 pl-4">
                                        {isMac ? (
                                            <CommandShortcut>⌘ + Click</CommandShortcut>
                                        ) : (
                                            <CommandShortcut>Ctrl + Click</CommandShortcut>
                                        )}{' '}
                                        or <CommandShortcut>Click + Hold</CommandShortcut>
                                    </TableCell>
                                    <TableCell className="p-1">select time on map.</TableCell>
                                </TableRow>
                                <TableRow className="pb-2">
                                    <TableCell className="p-1 pl-4">
                                        <CommandShortcut>Drag</CommandShortcut>
                                    </TableCell>
                                    <TableCell className="p-1">zoom into graph.</TableCell>
                                </TableRow>
                                <TableRow className="pb-2">
                                    <TableCell className="p-1 pl-4">
                                        <CommandShortcut>Click</CommandShortcut>
                                    </TableCell>
                                    <TableCell className="p-1">zoom out of graph.</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        <hr />
                    </div>
                )}
                <GeoChart />
                <hr />
                {!isV1 && (
                    <>
                        <EssenceChart />
                        <hr />
                        <GrubChart />
                        <hr />
                        <CompletionChart />
                        <hr />
                    </>
                )}
                <HealthChart />
                <hr />
                {!isV1 && (
                    <>
                        <SoulChart />
                        <hr />
                    </>
                )}
                {isV1 && (
                    <>
                        <CompletionChart />
                        <hr />
                        <GrubChart />
                    </>
                )}
                <div className="snap-start snap-normal" />
            </div>
        </div>
    );
}
