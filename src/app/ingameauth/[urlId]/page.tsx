import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';
import { getServerAuthSession } from '~/server/auth';
import { apiFromServer } from '~/trpc/from-server';
import { ContentCenterWrapper } from '../../_components/content-wrapper';
import { IngameAuthCard } from './components/ingameauth-components';
import { api } from '~/trpc/server';

export default async function IngameAuthPage({ params }: { params: { urlId: string } }) {
    // const hello = await api.post.hello.query({ text: "from tRPC" });
    const session = await getServerAuthSession();

    const ingameAuth = await (await apiFromServer()).ingameAuth.getByUrlIdIfNew({ urlId: params.urlId });

    if (!ingameAuth || ingameAuth.user) {
        return (
            <ContentCenterWrapper>
                <Card>
                    <CardHeader>
                        <CardTitle>This login link does not exist</CardTitle>
                        <CardDescription>This might be because one of the following reasons:</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-inside list-disc text-sm text-muted-foreground">
                            <li>The link was already used to login</li>
                            <li>The link has expired (after 10 minutes)</li>
                            <li>The link has never existed</li>
                        </ul>
                    </CardContent>
                </Card>
            </ContentCenterWrapper>
        );
    }

    if (!session) {
        const newUrlId = await (await apiFromServer()).ingameAuth.changeUrlId({ id: ingameAuth.id });
        redirect('/api/auth/signin?callbackUrl=/ingameauth/' + newUrlId);
    }

    // at this point nobody else should be able to use this token to access this page:
    await (await apiFromServer()).ingameAuth.removeUrlId({ id: ingameAuth.id });

    return (
        <ContentCenterWrapper>
            <IngameAuthCard
                ingameAuthId={ingameAuth.id}
                deviceName={ingameAuth.name}
                userName={session.user.name ?? 'unnamed account'}
            />
        </ContentCenterWrapper>
    );
}
