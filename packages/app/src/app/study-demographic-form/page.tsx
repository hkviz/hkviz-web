import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { headers } from 'next/headers';
import { getNavigationFlowFromCookies } from '~/lib/navigation-flow/from-cookies';
import { apiFromServer } from '~/trpc/from-server';
import { ContentCenterWrapper } from '../../../../app2/src/components/content-wrapper';
import { StudyDemographicClientForm } from './_components';

export default async function DataCollectionStudyParticipationPage() {
    const api = await apiFromServer();

    // if (!session) {
    //     return <AuthNeeded />;
    // }
    // // const studyParticipation = await (await apiFromServer()).studyParticipation.getStudyParticipation({});
    // const hasIngameAuthCookie = cookies().get(COOKIE_NAME_INGAME_AUTH_URL_ID) != null;

    const countryShortCode = headers().get('X-Vercel-IP-Country');
    const navigationFlow = getNavigationFlowFromCookies();

    const demographics = await api.studyDemographics.getFromLoggedInUserOrParticipantId();

    return (
        <ContentCenterWrapper>
            <Card className="w-full max-w-[70ch]">
                <CardHeader>
                    <CardTitle>Some questions about you</CardTitle>
                    <CardDescription>
                        This helps us better understand the diversity of our study participants. <br />
                        Your demographic data is deleted after the study is conducted.
                    </CardDescription>
                </CardHeader>
                <StudyDemographicClientForm
                    requestCountryShortCode={countryShortCode ?? undefined}
                    navigationFlow={navigationFlow}
                    hasPreviouslySubmitted={!!demographics}
                />
            </Card>
        </ContentCenterWrapper>
    );
}
