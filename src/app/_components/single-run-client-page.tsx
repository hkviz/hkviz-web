import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Session } from 'next-auth';
import { AppRouterOutput } from '~/server/api/types';

interface Props {
    session: Session | null;
    runData: AppRouterOutput['run']['getMetadataById'];
}

export function SingleRunClientPage({ session, runData }: Props) {
    return (
        <div className="m-2 flex min-h-full grow flex-col items-stretch justify-stretch gap-2 lg:flex-row">
            <Card className="lg:max-w-[500px]">
                <CardHeader>
                    <CardTitle>Metadata</CardTitle>
                    <CardDescription>Deploy your new project in one-click.</CardDescription>
                </CardHeader>
                <CardContent></CardContent>
            </Card>
            <Card className="grow">
                <CardContent>abc</CardContent>
            </Card>
        </div>
    );
}
