import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';
import { getServerAuthSession } from '~/server/auth';
import { apiFromServer } from '~/trpc/from-server';
import { ContentCenterWrapper } from '../../_components/content-wrapper';
import { IngameAuthCard } from './_components';
import { cookies } from 'next/headers';

export default async function IngameAuthPage({ params }: { params: { urlId: string } }) {
    const session = await getServerAuthSession();
    const urlId = params.urlId === 'cookie' ? cookies().get('ingameAuthUrlId')!.value : params.urlId;

    const ingameAuth = await (await apiFromServer()).ingameAuth.getByUrlIdIfNew({ urlId });

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
        redirect(`/ingameauth/${urlId}/login-redirect`);
    }

    const dataCollectionStudyParticipation = await (await apiFromServer()).studyParticipation.getStudyParticipation({});

    if (!dataCollectionStudyParticipation) {
        redirect(`/ingameauth/${urlId}/consent-redirect`);
    }

    // at this point nobody else should be able to use this token to access this page:
    await (await apiFromServer()).ingameAuth.removeUrlId({ id: ingameAuth.id });

    return (
        <ContentCenterWrapper>
            <IngameAuthCard
                ingameAuthId={ingameAuth.id}
                userName={session.user.name ?? 'unnamed account'}
            />
        </ContentCenterWrapper>
    );
}
