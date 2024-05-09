'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';

export function ContinueWithoutLoginUserStudyButton() {
    const setSkipLoginMutation = api.participant.setSkipLoginQuestion.useMutation();
    const router = useRouter();
    function handleClick() {
        setSkipLoginMutation.mutate();
        router.push('/user-study/flow?from=user-study-continue-without-login');
    }

    return (
        <Button onClick={handleClick} disabled={setSkipLoginMutation.isLoading || setSkipLoginMutation.isSuccess}>
            Continue without login
        </Button>
    );
}
