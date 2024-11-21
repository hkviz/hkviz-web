'use client';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { api } from '~/trpc/react';
import { MailLink } from '../../../../../app2/src/components/mail-link';

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
                    <CardTitle>Account marked for deletion</CardTitle>
                    <CardDescription>
                        <p>All your data will be deleted within 30 days.</p>
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
                    Mark your account for deletion. All your data associated with your account will be deleted within 30
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
                    Delete account
                </Button>
            </CardFooter>
        </Card>
    );
}
