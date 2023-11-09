'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Session } from 'next-auth';
import { useEffect } from 'react';
import { HKMap } from '~/lib/viz/charts/hk-map';
import { useRecordingFileQuery } from '~/lib/viz/recording-files/use-recording-file';
import { AppRouterOutput } from '~/server/api/types';

interface Props {
    session: Session | null;
    runData: AppRouterOutput['run']['getMetadataById'];
}

export function SingleRunClientPage({ session, runData }: Props) {
    const runFileQuery = useRecordingFileQuery({ runId: runData.id, downloadUrl: runData.signedDownloadFileUrl });

    return (
        <div className="m-2 flex min-h-full grow flex-col items-stretch justify-stretch gap-2 lg:flex-row">
            <Card className="lg:max-w-[500px]">
                <CardHeader>
                    <CardTitle>Metadata</CardTitle>
                    <CardDescription>Deploy your new project in one-click.</CardDescription>
                </CardHeader>
                <CardContent></CardContent>
            </Card>
            <Card className="flex grow flex-col overflow-hidden">
                <HKMap className="grow" />
            </Card>
        </div>
    );
}
