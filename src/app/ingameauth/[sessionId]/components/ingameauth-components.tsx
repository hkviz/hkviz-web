'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardTitle, CardHeader, CardDescription } from '@/components/ui/card';
import { useCallback } from 'react';
import { api } from '~/trpc/react';

export function IngameAuthCard({
    ingameSessionId,
    deviceName,
    userName,
}: {
    ingameSessionId: string;
    deviceName: string;
    userName: string;
}) {
    const allowMutation = api.ingameSession.allowLogin.useMutation({
        onError: (error) => {
            console.error('allowMutation', error);
        },
    });
    const cancelMutation = api.ingameSession.cancelLogin.useMutation({
        onError: (error) => {
            console.error('cancelMutation', error);
        },
    });

    const handleAllow = useCallback(async () => {
        allowMutation.reset();
        cancelMutation.reset();

        await allowMutation.mutateAsync({ id: ingameSessionId });
    }, [allowMutation, cancelMutation, ingameSessionId]);

    const handleCancel = useCallback(async () => {
        allowMutation.reset();
        cancelMutation.reset();

        await cancelMutation.mutateAsync({ id: ingameSessionId });
    }, [allowMutation, cancelMutation, ingameSessionId]);

    const isMutating = !!allowMutation.isLoading || !!cancelMutation.isLoading;

    if (allowMutation.isSuccess) {
        return (
            <Card className="max-w-[500px]">
                <CardHeader>
                    <CardTitle>Login successful</CardTitle>
                    <CardDescription>You may close this page now, and switch back to HollowKnight</CardDescription>
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
                <CardTitle>Allow device {deviceName} to upload play data?</CardTitle>
                <CardDescription>Data will be uploaded to the account {userName}</CardDescription>
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
