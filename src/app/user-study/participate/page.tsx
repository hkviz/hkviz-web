import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getLoginLink } from '~/app/_components/login-link-shared';
import { getServerAuthSession } from '~/server/auth';
import { ContentCenterWrapper } from '../../_components/content-wrapper';
import { ContinueWithoutLoginUserStudyButton } from './_continue-without-login-button';

export default async function UserStudyParticipatePage() {
    const loginUrl = getLoginLink('/user-study/flow');

    const session = await getServerAuthSession();
    const userId = session?.user?.id ?? null;

    if (userId) {
        redirect('/user-study/flow');
    }

    return (
        <ContentCenterWrapper>
            <Card className="w-full max-w-[70ch]">
                <CardHeader>
                    <CardTitle>Continue with login?</CardTitle>
                    <CardDescription>
                        If you have already used HKViz, you can skip a few steps by logging in.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="justify-end gap-2">
                    <ContinueWithoutLoginUserStudyButton />
                    <Button asChild>
                        <Link href={loginUrl}>Continue with login</Link>
                    </Button>
                </CardFooter>
            </Card>
        </ContentCenterWrapper>
    );
}
