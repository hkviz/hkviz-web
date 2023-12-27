import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentCenterWrapper } from './content-wrapper';
import { LoginButton } from './login-link';

export function AuthNeeded() {
    return (
        <ContentCenterWrapper>
            <Card>
                <CardHeader>
                    <CardTitle>Login required</CardTitle>
                    <CardDescription>This page requires authentication.</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-end">
                    <LoginButton />
                </CardFooter>
            </Card>
        </ContentCenterWrapper>
    );
}
