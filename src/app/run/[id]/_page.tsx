'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { type Session } from 'next-auth';
import { useEffect } from 'react';
import { HKMap } from '~/lib/viz/charts/hk-map';
import { useRunAggregationStore } from '~/lib/viz/recording-files/run-aggregation-store';
import { useRecordingFiles } from '~/lib/viz/recording-files/use-recording-files';
import { type AppRouterOutput } from '~/server/api/types';
import { AnimationOptions } from './_animation_options';
import { RoomInfo } from './_room_infos';
import { RunInfos } from './_run_infos';
import { useViewOptionsStoreRoot } from './_viewOptionsStore';
import { ViewOptions } from './_view_options';
import { RunExtraCharts } from './extra-charts/_run_extra_charts';

interface Props {
    session: Session | null;
    runData: AppRouterOutput['run']['getMetadataById'];
}

export function SingleRunClientPage({ session, runData }: Props) {
    const { combinedRun, ...runFiles } = useRecordingFiles(runData.id, runData.files);
    const aggregatedRunData = useRunAggregationStore((s) => s.aggregations[runData.id]);

    const useViewOptionsStore = useViewOptionsStoreRoot();

    const traceVisibility = useViewOptionsStore((s) => s.traceVisibility);
    const roomVisibility = useViewOptionsStore((s) => s.roomVisibility);
    const isAnythingAnimating = useViewOptionsStore((s) => s.isAnythingAnimating);
    const setRecording = useViewOptionsStore((s) => s.setRecording);
    const setAggregatedRunData = useViewOptionsStore((s) => s.setAggregatedRunData);
    const combinedRecording = combinedRun?.finishedLoading ? combinedRun.recording : null;

    useEffect(() => {
        setRecording(combinedRecording);
    }, [combinedRecording, setRecording]);

    useEffect(() => {
        setAggregatedRunData(aggregatedRunData ?? null);
    });

    return (
        <div className="m-2 flex min-h-full grow flex-col items-stretch justify-stretch gap-2 lg:flex-row">
            <div className="flex min-w-[250px] flex-row gap-2 overflow-x-auto lg:w-[300px] lg:flex-col">
                <Card className="max-lg:grow max-lg:basis-0 max-md:min-w-[300px] overflow-auto">
                    <CardContent className="px-0 pb-1">
                        <Tabs defaultValue="view-options" className="w-full">
                            <TabsList className="w-full bg-transparent">
                                <TabsTrigger
                                    value="run-info"
                                    className="data-[state=active]:bg-slate-300 dark:data-[state=active]:bg-slate-800"
                                >
                                    Run info
                                </TabsTrigger>
                                <TabsTrigger
                                    value="view-options"
                                    className="data-[state=active]:bg-slate-300 dark:data-[state=active]:bg-slate-800"
                                >
                                    View options
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="run-info">
                                <RunInfos session={session} runData={runData} />
                            </TabsContent>
                            <TabsContent value="view-options">
                                <ViewOptions useViewOptionsStore={useViewOptionsStore} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
                <RoomInfo useViewOptionsStore={useViewOptionsStore} />
            </div>
            <div className="flex grow flex-col gap-2">
                <Card className="relative flex grow flex-col overflow-hidden">
                    {/* <Tabs defaultValue="animate" className="w-[400px]">
                    <TabsList>
                        <TabsTrigger value="animate">Overview Map</TabsTrigger>
                        <TabsTrigger value="password">Game</TabsTrigger>
                    </TabsList>
                </Tabs> */}
                    <HKMap className="grow" useViewOptionsStore={useViewOptionsStore} />
                    <div
                        className={cn(
                            'absolute inset-0 flex items-center justify-center bg-opacity-40 p-4',
                            runFiles.finishedLoading ? 'invisible scale-125 opacity-0 transition' : '',
                        )}
                    >
                        <Progress value={(runFiles?.loadingProgress ?? 0) * 99 + 1} className="max-w-[400px]" />
                    </div>
                </Card>
                {isAnythingAnimating && combinedRecording && (
                    <AnimationOptions useViewOptionsStore={useViewOptionsStore} recording={combinedRecording} />
                )}
            </div>
            <div className="flex w-[400px] flex-col gap-2 overflow-auto lg:w-[400px]">
                <RunExtraCharts useViewOptionsStore={useViewOptionsStore} />
            </div>
        </div>
    );
}
