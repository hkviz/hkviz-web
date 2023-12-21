import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentCenterWrapper } from './content-wrapper';
import Link from 'next/link';

export function AuthNeeded() {
    return (
        <ContentCenterWrapper>
            <Card>
                <CardHeader>
                    <CardTitle>Login required</CardTitle>
                    <CardDescription>This page requires authentication.</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-end">
                    <Button asChild>
                        <Link href="/api/auth/signin">Sign in</Link>
                    </Button>
                </CardFooter>
            </Card>
        </ContentCenterWrapper>
    );
}
