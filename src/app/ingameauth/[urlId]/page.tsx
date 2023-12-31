import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerAuthSession } from '~/server/auth';
import { apiFromServer } from '~/trpc/from-server';
import { ContentCenterWrapper } from '../../_components/content-wrapper';
import { IngameAuthCard } from './_components';

export default async function IngameAuthPage({ params }: { params: { urlId: string } }) {
    const session = await getServerAuthSession();
    const urlId = params.urlId === 'cookie' ? cookies().get('ingameAuthUrlId')!.value : params.urlId;

    const api = await apiFromServer();

    const ingameAuth = await api.ingameAuth.getByUrlIdIfNew({ urlId });

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

    const dataCollectionStudyParticipation = await api.studyParticipation.getStudyParticipation({});

    console.log('1');

    if (!dataCollectionStudyParticipation) {
        console.log('2');
        redirect(`/ingameauth/${urlId}/consent-redirect`);
    }
    const userDemographics = await api.studyDemographics.getOwn({});

    if (!userDemographics && !dataCollectionStudyParticipation.excludedSinceU18) {
        console.log('3');
        redirect(`/ingameauth/${urlId}/demographics-redirect`);
    }

    const hkExperience = await api.hkExperience.getOwn({});

    if (!hkExperience && !dataCollectionStudyParticipation.excludedSinceU18) {
        console.log('4');
        redirect(`/ingameauth/${urlId}/experience-redirect`);
    }

    console.log('5');

    // at this point nobody else should be able to use this token to access this page:
    await (await apiFromServer()).ingameAuth.removeUrlId({ id: ingameAuth.id });

    return (
        <ContentCenterWrapper>
            <IngameAuthCard ingameAuthId={ingameAuth.id} userName={session.user.name ?? 'unnamed account'} />
        </ContentCenterWrapper>
    );
}
