import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SingleRunClientPage } from '~/app/_components/single-run-client-page';
import { getServerAuthSession } from '~/server/auth';
import { apiFromServer } from '~/trpc/from-server';
import { ContentCenterWrapper, ContentWrapper } from '../../_components/content-wrapper';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { IngameAuthCard } from './components/ingameauth-components';

export default async function IngameAuthPage({ params }: { params: { sessionId: string } }) {
    // const hello = await api.post.hello.query({ text: "from tRPC" });
    const session = await getServerAuthSession();

    const sessionInfo = await (await apiFromServer()).ingameSession.getStatus({ id: params.sessionId });

    if (!sessionInfo || sessionInfo.user) {
        return (
            <ContentCenterWrapper>
                <Card>
                    <CardHeader>
                        <CardTitle>This login link does not exist or has already been used</CardTitle>
                    </CardHeader>
                </Card>
            </ContentCenterWrapper>
        );
    }

    if (!session) {
        redirect('/api/auth/signin?callbackUrl=/ingameauth/' + params.sessionId);
    }

    return (
        <ContentCenterWrapper>
            <IngameAuthCard
                ingameSessionId={params.sessionId}
                deviceName={sessionInfo.name}
                userName={session.user.name ?? 'unnamed account'}
            />
        </ContentCenterWrapper>
    );
}
