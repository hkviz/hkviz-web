import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getServerAuthSession } from '~/server/auth';
import { AuthNeeded } from '../_components/auth-needed';
import { ContentCenterWrapper } from '../_components/content-wrapper';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default async function SettingsPage() {
    const session = await getServerAuthSession();
    if (!session) {
        return <AuthNeeded />;
    }

    return (
        <ContentCenterWrapper>
            <div className="max-w-[600px]">
                <h1 className="mb-4 pl-2 text-3xl font-semibold">Settings</h1>
                <Card>
                    <div className="p-6">
                        <div className="flex flex-row items-center justify-between">
                            <h3 className="text-lg font-semibold">Data collection study informed consent</h3>
                            <Button asChild>
                                <Link href="/study-consent-data-usage">View consent form</Link>
                            </Button>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex flex-row items-center justify-between">
                            <h3 className="text-lg font-semibold">Account deletion</h3>
                            <Button variant="destructive" asChild>
                                <Link href="/account-deletion">Create account deletion request</Link>
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </ContentCenterWrapper>
    );
}
