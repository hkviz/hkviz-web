import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cookies, headers } from 'next/headers';
import { getServerAuthSession } from '~/server/auth';
import { AuthNeeded } from '../_components/auth-needed';
import { ContentCenterWrapper } from '../_components/content-wrapper';
import { StudyDemographicClientForm } from './_components';

export default async function DataCollectionStudyParticipationPage() {
    const session = await getServerAuthSession();

    if (!session) {
        return <AuthNeeded />;
    }
    // const studyParticipation = await (await apiFromServer()).studyParticipation.getStudyParticipation({});
    const hasIngameAuthCookie = cookies().get('ingameAuthUrlId') != null;

    const countryShortCode = headers().get('X-Vercel-IP-Country');

    return (
        <ContentCenterWrapper>
            <Card>
                <CardHeader>
                    <CardTitle>Some questions about you</CardTitle>
                    <CardDescription>
                        This helps us better understand the diversity of our study participants. <br/> 
                        Your demographic data is deleted after the study is conducted.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <StudyDemographicClientForm requestCountryShortCode={countryShortCode ?? undefined} />
                </CardContent>
            </Card>
        </ContentCenterWrapper>
    );
}
