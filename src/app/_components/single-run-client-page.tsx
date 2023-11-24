'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { type Session } from 'next-auth';
import { useState } from 'react';
import { HKMap } from '~/lib/viz/charts/hk-map';
import { useRecordingFiles } from '~/lib/viz/recording-files/use-recording-file';
import { type AppRouterOutput } from '~/server/api/types';
import { RelativeDate } from './client-date';

interface Props {
    session: Session | null;
    runData: AppRouterOutput['run']['getMetadataById'];
}

export function SingleRunClientPage({ session, runData }: Props) {
    const runFiles = useRecordingFiles(runData.id, runData.files);
    const isFromUser = session?.user?.id === runData.user.id;

    const [roomVisibility, setRoomVisibility] = useState<'all' | 'mapped' | 'visited'>('all');

    return (
        <div className="m-2 flex min-h-full grow flex-col items-stretch justify-stretch gap-2 lg:flex-row">
            <div className="flex min-w-[250px] flex-row gap-2 overflow-x-auto lg:max-w-[500px] lg:flex-col">
                <Card className="grow max-md:min-w-[300px]">
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
                <Card className="grow max-md:min-w-[300pxF]">
                    <CardHeader>
                        <CardTitle>View</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                        <Table className="w-full">
                            <TableBody>
                                <TableRow>
                                    <TableHead>
                                        <Label htmlFor="visibleRoomSelectTrigger">Visible rooms</Label>
                                    </TableHead>
                                    <TableCell>
                                        <Select
                                            value={roomVisibility}
                                            onValueChange={(e) => setRoomVisibility(e as never)}
                                        >
                                            <SelectTrigger id="visibleRoomSelectTrigger">
                                                <SelectValue placeholder="Room visibility" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All</SelectItem>
                                                <SelectItem value="mapped">Mapped</SelectItem>
                                                <SelectItem value="visited">Visited</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <Card className="relative flex grow flex-col overflow-hidden">
                <HKMap className="grow" runFiles={runFiles.finishedLoading ? runFiles.files : null} />
                {/*runFiles?.finishedLoading ? runFiles.recording : null} />*/}
                <div
                    className={cn(
                        'absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 p-4',
                        runFiles.finishedLoading ? 'invisible scale-125 opacity-0 transition' : '',
                    )}
                >
                    <Progress value={(runFiles?.loadingProgress ?? 0) * 99 + 1} className="max-w-[400px]" />
                </div>
            </Card>
        </div>
    );
}
