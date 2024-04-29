'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';

export function UserStudyInformedConsentAcceptButton({ participantId }: { participantId: string }) {
    const router = useRouter();

    const { toast } = useToast();

    const acceptMutation = api.userStudyInformedConsent.accept.useMutation({
        onSuccess: () => {
            router.push('/user-study/flow?from=informed-consent-accept');
        },
        onError: (error) => {
            console.error('Failed to accept informed consent', error);
            toast({
                title: 'Failed to accept informed consent',
                description: error.message,
            });
        },
    });

    return (
        <Button
            variant="default"
            disabled={acceptMutation.isLoading || acceptMutation.isSuccess}
            onClick={() => acceptMutation.mutate({ participantId })}
        >
            Accept
        </Button>
    );
}
