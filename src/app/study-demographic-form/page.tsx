import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cookies, headers } from 'next/headers';
import { getServerAuthSession } from '~/server/auth';
import { apiFromServer } from '~/trpc/from-server';
import { ContentCenterWrapper } from '../_components/content-wrapper';
import { StudyDemographicClientForm } from './_components';

export default async function DataCollectionStudyParticipationPage() {
    const api = await apiFromServer();

    const session = await getServerAuthSession();

    // if (!session) {
    //     return <AuthNeeded />;
    // }
    // // const studyParticipation = await (await apiFromServer()).studyParticipation.getStudyParticipation({});
    // const hasIngameAuthCookie = cookies().get('ingameAuthUrlId') != null;

    const countryShortCode = headers().get('X-Vercel-IP-Country');
    const hasIngameAuthCookie = cookies().get('ingameAuthUrlId') != null;

    const demographics = session ? await api.studyDemographics.getOwn({}) : null;

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
                    hasIngameAuthCookie={hasIngameAuthCookie}
                    hasPreviouslySubmitted={!!demographics}
                />
            </Card>
        </ContentCenterWrapper>
    );
}
