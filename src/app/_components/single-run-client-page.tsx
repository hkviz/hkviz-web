'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { type Session } from 'next-auth';
import { useState } from 'react';
import { HKMap } from '~/lib/viz/charts/hk-map';
import { useRecordingFiles } from '~/lib/viz/recording-files/use-recording-file';
import { type AppRouterOutput } from '~/server/api/types';

interface Props {
    session: Session | null;
    runData: AppRouterOutput['run']['getMetadataById'];
}

export function SingleRunClientPage({ session, runData }: Props) {
    const [version, setVersion] = useState(1);

    const runFiles = useRecordingFiles(runData.id, runData.files);

    return (
        <div className="m-2 flex min-h-full grow flex-col items-stretch justify-stretch gap-2 lg:flex-row">
            <Card className="lg:max-w-[500px]">
                <CardHeader>
                    <CardTitle onClick={() => setVersion((v) => v + 1)}>Metadata</CardTitle>
                    <CardDescription>Deploy your new project in one-click.</CardDescription>
                </CardHeader>
                <CardContent></CardContent>
            </Card>
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
