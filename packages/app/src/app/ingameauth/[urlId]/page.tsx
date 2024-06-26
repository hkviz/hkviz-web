import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_NAME_INGAME_AUTH_URL_ID } from '~/lib/cookie-names';
import { getServerAuthSession } from '~/server/auth';
import { apiFromServer } from '~/trpc/from-server';
import { ContentCenterWrapper } from '../../_components/content-wrapper';
import { IngameAuthCard } from './_components';

export const metadata: Metadata = {
    title: 'Login - HKViz',
};

export default async function IngameAuthPage({ params }: { params: { urlId: string } }) {
    const session = await getServerAuthSession();
    const urlId = params.urlId === 'cookie' ? cookies().get(COOKIE_NAME_INGAME_AUTH_URL_ID)!.value : params.urlId;

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

    if (!dataCollectionStudyParticipation) {
        redirect(`/ingameauth/${urlId}/consent-redirect`);
    }
    const userDemographics = await api.studyDemographics.getFromLoggedInUser({});

    if (!userDemographics && !dataCollectionStudyParticipation.excludedSinceU18) {
        redirect(`/ingameauth/${urlId}/demographics-redirect`);
    }

    const hkExperience = await api.hkExperience.getFromLoggedInUser({});

    if (!hkExperience && !dataCollectionStudyParticipation.excludedSinceU18) {
        redirect(`/ingameauth/${urlId}/experience-redirect`);
    }

    // at this point nobody else should be able to use this token to access this page:
    await (await apiFromServer()).ingameAuth.removeUrlId({ id: ingameAuth.id });

    return (
        <ContentCenterWrapper>
            <IngameAuthCard ingameAuthId={ingameAuth.id} userName={session.user.name ?? 'unnamed account'} />
        </ContentCenterWrapper>
    );
}
