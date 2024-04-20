import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleCheck } from 'lucide-react';
import { ContentCenterWrapper } from '~/app/_components/content-wrapper';

export default function UserStudyDonePage() {
    return (
        <ContentCenterWrapper>
            <Card className="max-w-[60ch] text-center">
                <CardHeader>
                    <CardTitle>First part done!</CardTitle>
                </CardHeader>
                <CardContent>
                    <CircleCheck className="mb-4 inline-block h-10 w-10" />
                    <p className="text-pretty">Your interviewer will provide you with further instructions.</p>
                </CardContent>
            </Card>
        </ContentCenterWrapper>
    );
}
