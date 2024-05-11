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
import {
    AnimationOptionsWrapper,
    DashboardMapOptionsWrapper,
    RightCardWrapper,
    RunExtraChartsWrapper,
} from './_dynamic_loader';
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

            <RightCardWrapper />
            <MobileTabBar />
        </div>
    );
}
