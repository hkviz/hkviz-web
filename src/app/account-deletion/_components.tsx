'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { api } from '~/trpc/react';
import { MailLink } from '../_components/mail-link';

export function AccountDeletionForm(props: { removalRequestId: string }) {
    const acceptRemovalRequestMutation = api.account.acceptAccountRemovalRequest.useMutation();
    const handleAccept = async () => {
        acceptRemovalRequestMutation.reset();
        await acceptRemovalRequestMutation.mutateAsync({
            id: props.removalRequestId,
        });
    };

    if (acceptRemovalRequestMutation.isSuccess) {
        return (
            <Card className="max-w-[calc(100%-2rem] w-[600px]">
                <CardHeader>
                    <CardTitle>Account deletion requested</CardTitle>
                    <CardDescription>
                        <p>Your account deletion has been requested. All your data will be deleted within 30 days.</p>
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-end">
                    <Button asChild>
                        <Link href="/api/auth/signout">Logout</Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    const isMutating = acceptRemovalRequestMutation.isLoading;

    return (
        <Card className="w-[600px] max-w-[calc(100%-2rem)]">
            <CardHeader>
                <CardTitle>Delete your account</CardTitle>
                <CardDescription>
                    Request your account deletion. All your data associated with your account will be deleted within 30
                    days.
                    {!!acceptRemovalRequestMutation.error && (
                        <p className="text-red-600">
                            There has been an error while requesting your account deletion. Please contact write a mail
                            to <MailLink /> instead. Sorry for the inconvenience.
                        </p>
                    )}
                </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end">
                <Button disabled={isMutating} onClick={handleAccept} variant="destructive">
                    Request account deletion
                </Button>
            </CardFooter>
        </Card>
    );
}
