'use client';

import { cardClasses, cardHeaderSmallClasses, cardTitleSmallClasses } from '@/components/additions/cards';
import { TabsListTransparent, TabsTriggerTransparent } from '@/components/additions/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs } from '@/components/ui/tabs';
import { Tooltip, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { TooltipTrigger } from '@radix-ui/react-tooltip';
import { Maximize, Minus, Rows } from 'lucide-react';
import { type Session } from 'next-auth';
import { useEffect, useRef, useState } from 'react';
import { type ImperativePanelHandle, type PanelGroupOnLayout } from 'react-resizable-panels';
import { HKMap } from '~/lib/viz/charts/hk-map';
import { useRunAggregationStore } from '~/lib/viz/recording-files/run-aggregation-store';
import { useRecordingFiles } from '~/lib/viz/recording-files/use-recording-files';
import { type GetRunResult } from '~/server/api/routers/run/run-get';
import { AnimationOptions } from './_animation_options';
import { RunExtraCharts } from './_extra-charts/_run_extra_charts';
import { RoomInfo } from './_room_infos';
import { RunOverviewTab } from './_run-overview-tab';
import { RunSplits } from './_run_splits';
import { useViewOptionsStoreRoot, type MainCardTab, type UseViewOptionsStore } from './_viewOptionsStore';
import { ViewOptions } from './_view_options';

interface Props {
    session: Session | null;
    runData: GetRunResult;
}

export function SingleRunClientPage({ session, runData }: Props) {
    const { combinedRun, ...runFiles } = useRecordingFiles(runData.id, runData.files);
    const aggregatedRunData = useRunAggregationStore((s) => s.aggregations[runData.id]);

    const useViewOptionsStore = useViewOptionsStoreRoot();
    const isAnythingAnimating = useViewOptionsStore((s) => s.isAnythingAnimating);
    const setRecording = useViewOptionsStore((s) => s.setRecording);
    const setAggregatedRunData = useViewOptionsStore((s) => s.setAggregatedRunData);
    const combinedRecording = combinedRun?.finishedLoading ? combinedRun.recording : null;
    const setMainCardTab = useViewOptionsStore((s) => s.setMainCardTab);
    const mainCardTab = useViewOptionsStore((s) => s.mainCardTab);
    const isV1 = useViewOptionsStore((s) => s.isV1());

    useEffect(() => {
        setRecording(combinedRecording);
    }, [combinedRecording, setRecording]);

    useEffect(() => {
        setAggregatedRunData(aggregatedRunData ?? null);
    });

    return (
        <div className="m-2 flex min-h-full grow flex-col items-stretch justify-stretch gap-2 lg:flex-row">
            <div className="flex min-w-[250px] flex-row gap-2 overflow-x-auto lg:w-[300px] lg:shrink-0 lg:flex-col">
                <Card className="max-lg:grow max-lg:basis-0 min-w-[300px] overflow-auto sm:min-w-min">
                    <CardHeader className={cardHeaderSmallClasses}>
                        <CardTitle className={cardTitleSmallClasses}>{isV1 ? 'View options' : 'Map options'}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-1">
                        <ViewOptions useViewOptionsStore={useViewOptionsStore} />
                    </CardContent>
                </Card>
                <RoomInfo useViewOptionsStore={useViewOptionsStore} />
            </div>
            <div className="flex grow flex-col gap-2">
                <Card className="relative grid grow grid-cols-1 grid-rows-1 overflow-hidden">
                    <Tabs
                        value={mainCardTab}
                        className="absolute left-0 right-0 top-0 z-10 mx-auto w-fit"
                        onValueChange={(tab: string) => setMainCardTab(tab as MainCardTab)}
                    >
                        <TabsListTransparent>
                            <TabsTriggerTransparent value="overview">Overview</TabsTriggerTransparent>
                            <TabsTriggerTransparent value="map">Map</TabsTriggerTransparent>
                        </TabsListTransparent>
                    </Tabs>

                    {/* <Tabs defaultValue="animate" className="w-[400px]">
                    <TabsList>
                        <TabsTrigger value="animate">Overview Map</TabsTrigger>
                        <TabsTrigger value="password">Game</TabsTrigger>
                    </TabsList>
                </Tabs> */}
                    <HKMap
                        className="col-start-1 col-end-1 row-start-1 row-end-1 min-h-[50vh]"
                        useViewOptionsStore={useViewOptionsStore}
                    />
                    <RunOverviewTab
                        className="col-start-1 col-end-1 row-start-1 row-end-1"
                        useViewOptionsStore={useViewOptionsStore}
                        runData={runData}
                        session={session}
                    />
                    <div
                        className={cn(
                            'absolute left-0 right-0 top-10 flex h-12 w-full items-center justify-center',
                            runFiles.finishedLoading ? 'invisible scale-125 opacity-0 transition' : '',
                        )}
                    >
                        <Progress value={(runFiles?.loadingProgress ?? 0) * 99 + 1} className="max-w-[400px]" />
                    </div>
                </Card>
                {(isAnythingAnimating || !isV1) && <AnimationOptions useViewOptionsStore={useViewOptionsStore} />}
            </div>

            <RightCard useViewOptionsStore={useViewOptionsStore} />
        </div>
    );
}

function ResizeButtons({
    state,
    minimize,
    medimize,
    maximize,
}: {
    state: 'minimized' | 'medimized' | 'maximized';
    minimize: () => void;
    medimize: () => void;
    maximize: () => void;
}) {
    return (
        <div className="-ml-3 inline-block">
            {state !== 'minimized' && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={minimize}>
                            <Minus className="h-3 w-3" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Close</TooltipContent>
                </Tooltip>
            )}
            {state !== 'medimized' && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={medimize}>
                            <Rows className="h-3 w-3" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Show splits & time-based charts</TooltipContent>
                </Tooltip>
            )}
            {state !== 'maximized' && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={maximize}>
                            <Maximize className="h-3 w-3" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Maximize</TooltipContent>
                </Tooltip>
            )}
        </div>
    );
}

const DEFAULT_EXTRA_CHARTS_SIZE = 63;

function RightCard({ useViewOptionsStore }: { useViewOptionsStore: UseViewOptionsStore }) {
    const isV1 = useViewOptionsStore((s) => s.isV1());

    const [layoutState, setLayoutState] = useState<'only-extra-charts' | 'only-splits' | 'both'>('both');
    const extraChartsPanelRef = useRef<ImperativePanelHandle>(null);
    const splitsPanelRef = useRef<ImperativePanelHandle>(null);

    function closeExtraCharts() {
        extraChartsPanelRef.current?.resize(0);
    }

    function closeSplits() {
        splitsPanelRef.current?.resize(0);
    }

    function both() {
        extraChartsPanelRef.current?.resize(DEFAULT_EXTRA_CHARTS_SIZE);
    }

    const onLayout: PanelGroupOnLayout = (sizes) => {
        const [extraChartsSize, splitsSize] = sizes as [number, number];
        console.log({ extraChartsSize, splitsSize });
        if (extraChartsSize < 10) {
            setLayoutState('only-splits');
        } else if (splitsSize < 10) {
            setLayoutState('only-extra-charts');
        } else {
            setLayoutState('both');
        }
    };

    const runExtraChartsResizeOptions = isV1 ? null : (
        <ResizeButtons
            state={
                layoutState === 'both' ? 'medimized' : layoutState === 'only-extra-charts' ? 'maximized' : 'minimized'
            }
            minimize={closeExtraCharts}
            medimize={both}
            maximize={closeSplits}
        />
    );

    const splitsResizeOptions = isV1 ? null : (
        <ResizeButtons
            state={layoutState === 'both' ? 'medimized' : layoutState === 'only-splits' ? 'maximized' : 'minimized'}
            minimize={closeSplits}
            medimize={both}
            maximize={closeExtraCharts}
        />
    );

    return (
        <ResizablePanelGroup
            direction="vertical"
            className="h-unset-important min-h-[calc(100vh-var(--main-nav-height))] lg:min-h-[35rem] lg:max-w-[350px]"
            onLayout={onLayout}
        >
            <ResizablePanel
                defaultSize={DEFAULT_EXTRA_CHARTS_SIZE}
                collapsible
                minSize={30}
                className={cn(cardClasses, 'min-h-[44px]')}
                ref={extraChartsPanelRef}
            >
                <RunExtraCharts useViewOptionsStore={useViewOptionsStore} resizeOptions={runExtraChartsResizeOptions} />
            </ResizablePanel>
            {!isV1 && (
                <>
                    <ResizableHandle withHandle className="bg-transparent p-1" />
                    <ResizablePanel
                        defaultSize={100 - DEFAULT_EXTRA_CHARTS_SIZE}
                        collapsible
                        minSize={30}
                        className={cn(cardClasses, 'min-h-[44px]')}
                        ref={splitsPanelRef}
                    >
                        <RunSplits useViewOptionsStore={useViewOptionsStore} resizeOptions={splitsResizeOptions} />
                    </ResizablePanel>
                </>
            )}
        </ResizablePanelGroup>
    );

    // const isV1 = useViewOptionsStore((s) => s.isV1());
    // return (
    //     <Card className="flex w-full flex-col overflow-hidden lg:w-[400px]">
    //         {isV1 && (
    //             <CardHeader className="px-4 pb-3 pt-2">
    //                 <CardTitle className="text-lg">Time-based analytics</CardTitle>
    //             </CardHeader>
    //         )}
    //         <Tabs defaultValue={isV1 ? 'extra-charts' : 'splits'} className="flex grow flex-col">
    //             {!isV1 && (
    //                 <TabsListTransparent className="flex flex-row justify-center">
    //                     <TabsTriggerTransparent value="splits">Splits</TabsTriggerTransparent>
    //                     <TabsTriggerTransparent value="extra-charts">Time charts</TabsTriggerTransparent>
    //                 </TabsListTransparent>
    //             )}
    //             <TabsContent value="splits" className="hidden shrink grow flex-col data-[state='active']:flex">
    //                 <RunSplits useViewOptionsStore={useViewOptionsStore} />
    //             </TabsContent>
    //             <TabsContent value="extra-charts" className="hidden shrink grow flex-col data-[state='active']:flex">
    //                 <RunExtraCharts useViewOptionsStore={useViewOptionsStore} />
    //             </TabsContent>
    //         </Tabs>
    //     </Card>
    // );
}
