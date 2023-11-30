import Link from 'next/link';
import { ContentCenterWrapper } from './_components/content-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <ContentCenterWrapper>
            <Card>
                <CardHeader>
                    <CardTitle>404 Not Found</CardTitle>
                    <CardDescription>
                        This page does not exist.{' '}
                        <Button asChild variant="link" className="p-0">
                            <Link href="/">Return to start</Link>
                        </Button>
                        .
                    </CardDescription>
                </CardHeader>
            </Card>
        </ContentCenterWrapper>
    );
}
