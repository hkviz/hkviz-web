'use client';

import { cardClasses, cardRoundedMdOnlyClasses } from '@/components/additions/card';
import { TabsListTransparent, TabsTriggerTransparent } from '@/components/additions/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs } from '@/components/ui/tabs';
import { Tooltip, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { type MainCardTab } from '@hkviz/viz';
import { useSignals } from '@preact/signals-react/runtime';
import { TooltipTrigger } from '@radix-ui/react-tooltip';
import { Maximize, Minus, Rows } from 'lucide-react';
import { type Session } from 'next-auth';
import { useEffect, useRef, useState } from 'react';
import { type ImperativePanelHandle, type PanelGroupOnLayout } from 'react-resizable-panels';
import { splitsStore } from '~/lib/stores/splits-store';
import { storeInitializer, useStoreInitializer } from '~/lib/stores/store-initializer';
import { uiStore } from '~/lib/stores/ui-store';
import { HKMap } from '~/lib/viz/charts/hk-map';
import { useRecordingFiles } from '~/lib/viz/use-recording-files';
import { type GetRunResult } from '~/server/api/routers/run/run-get';
import { AnimationOptionsWrapper, DashboardMapOptionsWrapper } from './_dynamic_loader';
import { RunExtraCharts } from './_extra-charts/_run_extra_charts';
import { MobileTabBar } from './_mobile-tabs';
import { RunOverviewTab } from './_run-overview-tab';
import { RunSplits } from './_run_splits';
import { SingleRunPageTour } from './_tour';

interface Props {
    session: Session | null;
    runData: GetRunResult;
}

function RunClientLoader({ runData }: { runData: GetRunResult }) {
    const { combinedRun, ...runFiles } = useRecordingFiles(runData.id, runData.files);
    const combinedRecording = combinedRun?.finishedLoading ? combinedRun.recording : null;

    useEffect(() => {
        storeInitializer.initializeFromRecording(combinedRecording);
    }, [combinedRecording]);

    return (
        <div
            className={cn(
                'absolute left-0 right-0 top-10 flex h-12 w-full items-center justify-center',
                runFiles.finishedLoading ? 'invisible scale-125 opacity-0 transition' : '',
            )}
        >
            <Progress value={(runFiles?.loadingProgress ?? 0) * 99 + 1} className="max-w-[400px]" />
        </div>
    );
}

export function SingleRunClientPage({ session, runData }: Props) {
    useStoreInitializer();
    useSignals();
    const mainCardTab = uiStore.mainCardTab.valuePreact;
    const mobileTab = uiStore.mobileTab.valuePreact;

    // const layout = useSignal<HTMLDivElement | null>(null);
    // const layoutSize = useElementSize(layout);

    // const isMobileLayoutSignal = useComputed(() => {
    //     const width = layoutSize.value.width;
    //     console.log(width);
    //     return width !== 0 && width < 768; // tailwind md breakpoint
    // });
    // const isMobileLayout = isMobileLayoutSignal.value;

    return (
        <div className="dashboard-grid">
            <DashboardMapOptionsWrapper />
            <Card
                className={cn(
                    cardRoundedMdOnlyClasses,
                    'relative grow grid-cols-1 grid-rows-1 overflow-hidden border-t',
                    mobileTab === 'overview' ? 'dashboard-grid-map-big' : 'dashboard-grid-map',
                    mobileTab === 'overview' || mobileTab === 'map' ? 'grid' : 'hidden lg:grid',
                )}
            >
                <Tabs
                    value={mainCardTab}
                    className="absolute left-0 right-0 top-0 z-10 mx-auto hidden w-fit lg:block"
                    onValueChange={(tab: string) => {
                        uiStore.activateTab(tab as MainCardTab);
                    }}
                >
                    <TabsListTransparent>
                        <TabsTriggerTransparent value="overview">Overview</TabsTriggerTransparent>
                        <TabsTriggerTransparent value="map" className="map-tab-large-layout">
                            Map
                        </TabsTriggerTransparent>
                    </TabsListTransparent>
                </Tabs>
                <HKMap className="col-start-1 col-end-1 row-start-1 row-end-1" />
                <RunOverviewTab
                    className="col-start-1 col-end-1 row-start-1 row-end-1"
                    runData={runData}
                    session={session}
                />
                <RunClientLoader runData={runData} />
                <SingleRunPageTour />
            </Card>
            <AnimationOptionsWrapper className="dashboard-grid-timeline" />

            <RightCard className="dashboard-grid-splits-and-timecharts" />
            <MobileTabBar />
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
        <div className="-ml-3 hidden shrink-0 pl-1 lg:inline-block">
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

function RightCard({ className }: { className?: string }) {
    useSignals();
    const isV1 = uiStore.isV1.value;
    const mobileTab = uiStore.mobileTab.valuePreact;

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
        const [splitsSize, extraChartsSize] = sizes as [number, number];
        console.log({ extraChartsSize, splitsSize });
        if (extraChartsSize < 10) {
            setLayoutState('only-splits');
            splitsStore.isSplitsPanelOpen.value = true;
        } else if (splitsSize < 10) {
            setLayoutState('only-extra-charts');
            splitsStore.isSplitsPanelOpen.value = false;
        } else {
            setLayoutState('both');
            splitsStore.isSplitsPanelOpen.value = true;
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
        <div className={cn(mobileTab === 'splits' || mobileTab === 'time-charts' ? '' : 'hidden lg:flex', className)}>
            <ResizablePanelGroup direction="vertical" onLayout={onLayout}>
                {!isV1 && (
                    <>
                        <ResizablePanel
                            defaultSize={100 - DEFAULT_EXTRA_CHARTS_SIZE}
                            collapsible
                            minSize={18}
                            className={cn(
                                cardClasses,
                                cardRoundedMdOnlyClasses,
                                'min-h-[44px] border-t',
                                mobileTab === 'splits' ? '' : 'hidden lg:block',
                            )}
                            ref={splitsPanelRef}
                        >
                            <RunSplits resizeOptions={splitsResizeOptions} />
                        </ResizablePanel>
                        <ResizableHandle withHandle className="hidden bg-transparent p-1 lg:flex" />
                    </>
                )}
                <ResizablePanel
                    defaultSize={DEFAULT_EXTRA_CHARTS_SIZE}
                    collapsible
                    minSize={30}
                    className={cn(
                        cardClasses,
                        cardRoundedMdOnlyClasses,
                        'min-h-[44px] border-t',
                        mobileTab === 'time-charts' ? '' : 'hidden lg:block',
                    )}
                    ref={extraChartsPanelRef}
                >
                    <RunExtraCharts resizeOptions={runExtraChartsResizeOptions} />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );

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
    //                 <RunSplits  />
    //             </TabsContent>
    //             <TabsContent value="extra-charts" className="hidden shrink grow flex-col data-[state='active']:flex">
    //                 <RunExtraCharts  />
    //             </TabsContent>
    //         </Tabs>
    //     </Card>
    // );
}
