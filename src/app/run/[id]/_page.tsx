'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { type Session } from 'next-auth';
import { useEffect } from 'react';
import { HKMap } from '~/lib/viz/charts/hk-map';
import { useRecordingFiles } from '~/lib/viz/recording-files/use-recording-files';
import { type AppRouterOutput } from '~/server/api/types';
import { RelativeDate } from '../../_components/date';
import { AnimationOptions } from './_animation_options';
import { useViewOptionsStoreRoot } from './_viewOptionsStore';
import { ViewOptions } from './_view_options';
import { RoomInfo } from './_room_infos';

interface Props {
    session: Session | null;
    runData: AppRouterOutput['run']['getMetadataById'];
}

export function SingleRunClientPage({ session, runData }: Props) {
    const { combinedRun, ...runFiles } = useRecordingFiles(runData.id, runData.files);
    const isFromUser = session?.user?.id === runData.user.id;

    const useViewOptionsStore = useViewOptionsStoreRoot();

    const traceVisibility = useViewOptionsStore((s) => s.traceVisibility);
    const setRecording = useViewOptionsStore((s) => s.setRecording);
    const combinedRecording = combinedRun?.finishedLoading ? combinedRun.recording : null;

    useEffect(() => {
        setRecording(combinedRecording);
    }, [combinedRecording, setRecording]);

    return (
        <div className="m-2 flex min-h-full grow flex-col items-stretch justify-stretch gap-2 lg:flex-row">
            <div className="flex min-w-[250px] flex-row gap-2 overflow-x-auto lg:w-[300px] lg:flex-col">
                <Card className="max-lg:grow max-lg:basis-0 max-md:min-w-[300px]">
                    <CardHeader>
                        <CardTitle>Run info</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                        <Table className="w-full">
                            <TableBody>
                                <TableRow>
                                    <TableHead>From</TableHead>
                                    <TableCell>{isFromUser ? 'You' : runData.user.name}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableHead>Started</TableHead>
                                    <TableCell>
                                        {runData.startedAt && <RelativeDate date={runData.startedAt} />}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableHead>Last played</TableHead>
                                    <TableCell>
                                        {runData.lastPlayedAt && <RelativeDate date={runData.lastPlayedAt} />}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableHead>Visibility</TableHead>
                                    <TableCell>Public</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <ViewOptions useViewOptionsStore={useViewOptionsStore} />
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
                            'absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 p-4',
                            runFiles.finishedLoading ? 'invisible scale-125 opacity-0 transition' : '',
                        )}
                    >
                        <Progress value={(runFiles?.loadingProgress ?? 0) * 99 + 1} className="max-w-[400px]" />
                    </div>
                </Card>
                {traceVisibility === 'animated' && combinedRecording && (
                    <AnimationOptions useViewOptionsStore={useViewOptionsStore} recording={combinedRecording} />
                )}
            </div>
        </div>
    );
}
