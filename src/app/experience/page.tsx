import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type Metadata } from 'next';
import { cookies } from 'next/headers';
import { getServerAuthSession } from '~/server/auth';
import { apiFromServer } from '~/trpc/from-server';
import { AuthNeeded } from '../_components/auth-needed';
import { ContentCenterWrapper } from '../_components/content-wrapper';
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

    if (!session) {
        return <AuthNeeded />;
    }
    const hasIngameAuthCookie = cookies().get('ingameAuthUrlId') != null;

    const hkExperience = session ? await api.hkExperience.getOwn({}) : null;

    return (
        <ContentCenterWrapper>
            <Card className="w-full max-w-[70ch]">
                <CardHeader>
                    <CardTitle>How much Hollow Knight did you play before?</CardTitle>
                    <CardDescription>
                        This helps us better understand how the previous experience influences the study results.
                    </CardDescription>
                </CardHeader>
                <HkExperienceClientForm
                    hasIngameAuthCookie={hasIngameAuthCookie}
                    hasPreviouslySubmitted={!!hkExperience}
                />
            </Card>
        </ContentCenterWrapper>
    );
}
