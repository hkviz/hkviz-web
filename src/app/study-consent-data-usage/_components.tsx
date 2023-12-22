'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import React, { useId, useState } from 'react';
import { api } from '~/trpc/react';
import { useConsentFormStore } from './_form_store';

export function DataCollectionStudyParticipationForm({
    className,
    formPositionText,
}: {
    className?: string;
    formPositionText: string;
}) {
    const participate = useConsentFormStore((state) => state.participate);
    const setParticipate = useConsentFormStore((state) => state.setParticipate);
    const keepDataAfterStudy = useConsentFormStore((state) => state.keepDataAfterStudy);
    const setKeepDataAfterStudy = useConsentFormStore((state) => state.setKeepDataAfterStudy);

    const id = useId();

    const saveMutation = api.account.acceptAccountRemovalRequest.useMutation();
    const handleAccept = async () => {
        saveMutation.reset();
        // await saveMutation.mutateAsync({
        //     id: props.removalRequestId,
        // });
    };

    if (saveMutation.isSuccess) {
        return (
            <Card className={cn('max-w-[calc(100%-2rem] w-[600px]', className)}>
                <CardHeader>
                    <CardTitle>Your preference has been saved</CardTitle>
                    <CardDescription>
                        <p>{participate && 'Thank you for participating in the study.'}</p>
                        <p>{!participate && 'Your data will not be used as part of the study.'}</p>
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const isMutating = saveMutation.isLoading;

    const buttonText = participate
        ? keepDataAfterStudy
            ? 'Participate'
            : 'Participate and delete account after study'
        : 'Do not participate';
    return (
        <Card className={cn('w-[600px] max-w-[calc(100vw-2rem)]', className)}>
            <CardHeader className="px-4 pb-1 pt-4">
                <CardTitle className="m-0">Can we use your gameplay data as part of a research study?</CardTitle>
                <CardDescription>
                    All data will always be reported in anonymized form.
                    {!!saveMutation.error && <p className="text-red-600">Storing your participation choice failed</p>}
                </CardDescription>
            </CardHeader>
            <CardContent className="py-2">
                <form>
                    <fieldset disabled={isMutating}>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id={id + 'participate'}
                                    checked={participate}
                                    onCheckedChange={setParticipate}
                                />
                                <label
                                    htmlFor={id + 'participate'}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    I want to participate and and agree to the Informed Consent Form {formPositionText}.
                                </label>
                            </div>

                            <div
                                className="flex items-center space-x-2"
                                style={{ opacity: participate ? undefined : 0 }}
                            >
                                <Checkbox
                                    id={id + 'keep-account'}
                                    checked={keepDataAfterStudy || !participate}
                                    onCheckedChange={setKeepDataAfterStudy}
                                    disabled={!participate}
                                    tabIndex={participate ? undefined : -1}
                                />
                                <label
                                    htmlFor={id + 'keep-account'}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Keep my gameplay data after the study has been conduced, so I can continue to login
                                    and view my visualized data.
                                </label>
                            </div>
                        </div>
                    </fieldset>
                </form>
            </CardContent>
            <CardFooter className="flex justify-end px-2 pb-2">
                <Button
                    disabled={isMutating}
                    onClick={handleAccept}
                    variant={participate && !keepDataAfterStudy ? 'destructive' : 'default'}
                >
                    {buttonText}
                </Button>
            </CardFooter>
        </Card>
    );
}

export function FadeBackground({ className, children }: React.PropsWithChildren<{ className?: string }>) {
    return (
        <div className={cn('', className)}>
            <div className="absolute bottom-0 left-0 right-0 top-0 -z-10 bg-[linear-gradient(_var(--tw-gradient-stops))] from-[#f1f1f7] via-[#f1f1f7]/90 to-transparent dark:from-[#080b1c] dark:via-[#080b1c]/90" />
            {children}
        </div>
    );
}

{
    /* <FadeBackground className="sticky top-[var(--main-nav-height)] z-10 h-fit pb-4">
    <DataCollectionStudyParticipationForm className=" mx-auto mt-2" />
</FadeBackground> */
}
