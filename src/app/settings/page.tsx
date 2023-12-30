import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { getServerAuthSession } from '~/server/auth';
import { apiFromServer } from '~/trpc/from-server';
import { AuthNeeded } from '../_components/auth-needed';
import { ContentCenterWrapper } from '../_components/content-wrapper';
import { KeepAccountSettingsOption } from './_components';

export default async function SettingsPage() {
    const session = await getServerAuthSession();
    if (!session) {
        return <AuthNeeded />;
    }

    const studyParticipation = await (await apiFromServer()).studyParticipation.getStudyParticipation({});

    return (
        <ContentCenterWrapper>
            <div className="max-w-[600px]">
                <h1 className="mb-4 pl-2 font-serif text-3xl font-semibold">Settings</h1>
                <Card>
                    <div className="p-6">
                        <KeepAccountSettingsOption studyParticipation={studyParticipation} />
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h3 className="text-lg font-semibold">Data collection study informed consent</h3>
                                <p className="text-sm text-gray-500">
                                    {studyParticipation
                                        ? 'Configure if we may contact you for a follow-up user study and what will happen to your data after the study is conducted.'
                                        : 'Consent to the usage of your play data for our research project'}
                                </p>
                            </div>
                            <Button asChild className="shrink-0">
                                <Link href="/study-consent-data-usage">View consent form</Link>
                            </Button>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h3 className="text-lg font-semibold">Account deletion</h3>
                                <p className="text-sm text-gray-500">Delete your account and your game play data.</p>
                            </div>
                            <Button variant="destructive" asChild className="shrink-0">
                                <Link href="/settings/account-deletion">Delete account</Link>
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </ContentCenterWrapper>
    );
}
