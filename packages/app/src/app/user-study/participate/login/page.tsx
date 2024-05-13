import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { HKVizText } from '~/app/_components/hkviz-text';
import { getLoginLink } from '~/app/_components/login-link-shared';
import { getServerAuthSession } from '~/server/auth';
import { ContentCenterWrapper } from '../../../_components/content-wrapper';
import { ContinueWithoutLoginUserStudyButton } from './_continue-without-login-button';

import { type Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login in for the HKViz user study',
};

export default async function UserStudyParticipatePage() {
    const loginUrl = getLoginLink('/user-study/flow?from=user-study-login');

    const session = await getServerAuthSession();
    const userId = session?.user?.id ?? null;

    if (userId) {
        redirect('/user-study/flow?from=user-study-participate-auto-redirect');
    }

    return (
        <ContentCenterWrapper>
            <Card className="w-full max-w-[70ch]">
                <CardHeader>
                    <CardTitle>
                        Do you already have a <HKVizText /> account?
                    </CardTitle>
                    <CardDescription>
                        If you have already used HKViz before, you can skip a form, since you filled it out already.{' '}
                        <br />
                        If not, no need to create an account, you can continue without login.
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
