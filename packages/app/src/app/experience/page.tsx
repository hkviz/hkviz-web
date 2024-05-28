import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type Metadata } from 'next';
import { getNavigationFlowFromCookies } from '~/lib/navigation-flow/from-cookies';
import { getServerAuthSession } from '~/server/auth';
import { apiFromServer } from '~/trpc/from-server';
import { ContentCenterWrapper } from '../../../../app2/src/components/content-wrapper';
import { HkExperienceClientForm } from './_components';

export const metadata: Metadata = {
    title: 'Your previous Hollow Knight experience - HKViz',
    alternates: {
        canonical: '/experience',
    },
};

export default async function DataCollectionStudyParticipationPage() {
    const api = await apiFromServer();

    const session = await getServerAuthSession();

    // if (!session) {
    //     return <AuthNeeded />;
    // }
    const navigationFlow = getNavigationFlowFromCookies();

    const hkExperience = session ? await api.hkExperience.getFromLoggedInUserOrParticipantId() : null;

    return (
        <ContentCenterWrapper>
            <Card className="w-full max-w-[70ch]">
                <CardHeader>
                    <CardTitle className="leading-snug">Your previous Hollow Knight experience</CardTitle>
                    <CardDescription>
                        This helps us better understand how the previous experience influences the study results.
                    </CardDescription>
                </CardHeader>
                <HkExperienceClientForm navigationFlow={navigationFlow} existingHkExperience={hkExperience ?? null} />
            </Card>
        </ContentCenterWrapper>
    );
}
