import { cardHeaderSmallClasses, cardTitleSmallClasses } from '@/components/additions/cards';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CommandShortcut } from '@/components/ui/command';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useId, type ReactNode } from 'react';
import { type UseViewOptionsStore } from '../_viewOptionsStore';
import { CompletionChart } from './completion-chart';
import { GeoChart } from './geo-chart';
import { GrubChart } from './grub-chart';
import { HealthChart } from './health-chart';
import { SoulChart } from './soul-chart';

export interface RunExtraChartsProps {
    useViewOptionsStore: UseViewOptionsStore;
    resizeOptions: ReactNode;
}

export function RunExtraCharts({ useViewOptionsStore, resizeOptions }: RunExtraChartsProps) {
    const isV1 = useViewOptionsStore((s) => s.isV1());

    const id = useId();
    const extraChartsFollowAnimation = useViewOptionsStore((s) => s.extraChartsFollowAnimation);
    const setExtraChartsFollowAnimation = useViewOptionsStore((s) => s.setExtraChartsFollowAnimation);
    const isAnythingAnimating = useViewOptionsStore((s) => s.isAnythingAnimating);

    const isMac = typeof window !== 'undefined' ? /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent) : false;
    return (
        <div className="flex h-full snap-start flex-col">
            <CardHeader className={cardHeaderSmallClasses}>
                <CardTitle className={cn(cardTitleSmallClasses, 'flex w-full flex-row justify-between')}>
                    Time-based charts
                    {resizeOptions}
                </CardTitle>
            </CardHeader>
            {(!isV1 || isAnythingAnimating) && (
                <div className="flex flex-row gap-2 px-4 pb-2">
                    <Checkbox
                        id={id + 'follow_anim'}
                        checked={extraChartsFollowAnimation}
                        onCheckedChange={setExtraChartsFollowAnimation}
                    />
                    <label
                        htmlFor={id + 'follow_anim'}
                        className="grow text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Follow animation
                    </label>
                </div>
            )}
            <hr />
            <div className="shrink grow snap-y snap-proximity overflow-y-auto lg:shrink lg:basis-0">
                {!isV1 && (
                    <>
                        <Table className="pb-2">
                            <TableBody>
                                <TableRow>
                                    <TableCell className="p-1 pl-4">
                                        {isMac ? (
                                            <CommandShortcut>⌘ + Click</CommandShortcut>
                                        ) : (
                                            <CommandShortcut>Ctrl + Click</CommandShortcut>
                                        )}
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
                    </>
                )}
                <GeoChart useViewOptionsStore={useViewOptionsStore} />
                <hr />
                <HealthChart useViewOptionsStore={useViewOptionsStore} />
                <hr />
                {!isV1 && (
                    <>
                        <SoulChart useViewOptionsStore={useViewOptionsStore} />
                        <hr />
                    </>
                )}
                <CompletionChart useViewOptionsStore={useViewOptionsStore} />
                <hr />
                <GrubChart useViewOptionsStore={useViewOptionsStore} />
            </div>
        </div>
    );
}
