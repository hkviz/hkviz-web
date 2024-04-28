import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleCheck } from 'lucide-react';
import { ContentCenterWrapper } from '~/app/_components/content-wrapper';

export default function UserStudyDonePage() {
    return (
        <ContentCenterWrapper>
            <Card className="max-w-[60ch] text-center">
                <CardHeader>
                    <CardTitle className="leading-normal">
                        Thank you for completing <br />
                        the first part!
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <CircleCheck className="mb-4 inline-block h-10 w-10" />
                    <p className="text-pretty">All ready for the call with the researcher.</p>
                </CardContent>
            </Card>
        </ContentCenterWrapper>
    );
}
