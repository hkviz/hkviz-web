import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleCheck } from 'lucide-react';
import Link from 'next/link';
import { ContentCenterWrapper } from '~/app/_components/content-wrapper';
import { getParticipantIdFromCookieOrSessionUser } from '../_utils';

export default function UserStudyDonePage() {
    const participantId = await getParticipantIdFromCookieOrSessionUser();

    return (
        <ContentCenterWrapper>
            <Card className="max-w-[60ch] text-center">
                <CardHeader>
                    <CardTitle className="leading-normal">Thank you for filling out!</CardTitle>
                </CardHeader>
                <CardContent>
                    <CircleCheck className="mb-4 inline-block h-10 w-10" />
                    <p className="text-pretty">
                        <Button asChild>
                            <Link href={'/user-study/participate/' + participantId}>
                                Back to participation overview
                            </Link>
                        </Button>
                    </p>
                </CardContent>
            </Card>
        </ContentCenterWrapper>
    );
}
