'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCallback } from 'react';
import { api } from '~/trpc/react';

export function IngameAuthCard({ ingameAuthId, userName }: { ingameAuthId: string; userName: string }) {
    const allowMutation = api.ingameAuth.allowLogin.useMutation({
        onError: (error) => {
            console.error('allowMutation', error);
        },
    });
    const cancelMutation = api.ingameAuth.cancelLogin.useMutation({
        onError: (error) => {
            console.error('cancelMutation', error);
        },
    });

    const handleAllow = useCallback(async () => {
        allowMutation.reset();
        cancelMutation.reset();

        await allowMutation.mutateAsync({ id: ingameAuthId });
    }, [allowMutation, cancelMutation, ingameAuthId]);

    const handleCancel = useCallback(async () => {
        allowMutation.reset();
        cancelMutation.reset();

        await cancelMutation.mutateAsync({ id: ingameAuthId });
    }, [allowMutation, cancelMutation, ingameAuthId]);

    const isMutating = !!allowMutation.isLoading || !!cancelMutation.isLoading;

    if (allowMutation.isSuccess) {
        return (
            <Card className="max-w-[500px]">
                <CardHeader>
                    <CardTitle>Login successful</CardTitle>
                    <CardDescription>You may now close this page, and switch back to Hollow Knight</CardDescription>
                </CardHeader>
            </Card>
        );
    }
    if (cancelMutation.isSuccess) {
        return (
            <Card className="max-w-[500px]">
                <CardHeader>
                    <CardTitle>Login canceled</CardTitle>
                    <CardDescription>You may close this page now</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="max-w-[500px]">
            <CardHeader>
                <CardTitle>Allow this device to upload play data?</CardTitle>
                <CardDescription>
                    Data will be uploaded to {userName ? 'the account ' + userName : 'your account'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!!allowMutation.error && <p className="text-red-600">Could not login</p>}
                {!!cancelMutation.error && <p className="text-red-600">Could not cancel login</p>}
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
                <Button className="grow" variant="outline" onClick={handleCancel} disabled={isMutating}>
                    Cancel
                </Button>
                <Button className="grow" onClick={handleAllow} disabled={isMutating}>
                    Allow
                </Button>
            </CardFooter>
        </Card>
    );
}
