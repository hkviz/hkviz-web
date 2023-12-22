'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import React, { useId, useMemo } from 'react';
import { type AppRouterOutput } from '~/server/api/types';
import { api } from '~/trpc/react';
import { useConsentFormStore } from './_form_store';

export function DataCollectionStudyParticipationClientForm({
    className,
    formPositionText,
    savedStudyParticipation,
    hasIngameAuthCookie,
}: {
    className?: string;
    formPositionText: string;
    savedStudyParticipation: AppRouterOutput['studyParticipation']['getStudyParticipation'];
    hasIngameAuthCookie: boolean;
}) {
    const setFutureContactOk = useConsentFormStore((state) => state.setFutureContactOk);
    const setKeepDataAfterStudyConducted = useConsentFormStore((state) => state.setKeepDataAfterStudyConducted);

    const futureContactOk = useConsentFormStore((state) => state.futureContactOk);
    const keepDataAfterStudyConducted = useConsentFormStore((state) => state.keepDataAfterStudyConducted);

    const id = useId();
    const router = useRouter();

    const saveMutation = api.studyParticipation.saveStudyParticipation.useMutation();

    useMemo(() => {
        if (savedStudyParticipation) {
            setFutureContactOk(savedStudyParticipation.futureContactOk);
            setKeepDataAfterStudyConducted(savedStudyParticipation.keepDataAfterStudyConducted);
        }
    }, [setFutureContactOk, setKeepDataAfterStudyConducted, savedStudyParticipation]);

    const handleAccept = async () => {
        saveMutation.reset();
        await saveMutation.mutateAsync({
            futureContactOk,
            keepDataAfterStudyConducted,
        });
        if (hasIngameAuthCookie) {
            router.push('/ingameauth/cookie');
        }
    };

    const hasPreviouslyAccepted = !!savedStudyParticipation;

    const isMutating = saveMutation.isLoading;

    const buttonVerb = hasPreviouslyAccepted ? 'Save' : 'Participate';
    const buttonText = keepDataAfterStudyConducted ? buttonVerb : `${buttonVerb} and delete account after study`;
    return (
        <Card className={cn('w-[600px] max-w-[calc(100vw-2rem)]', className)}>
            <CardHeader>
                <CardTitle>
                    {hasPreviouslyAccepted
                        ? 'Thank you for participating in the study.'
                        : `By using the HKViz mod, you agree to the informed consent form ${formPositionText}`}
                </CardTitle>
                <CardDescription>
                    {hasPreviouslyAccepted
                        ? 'You have already accepted the informed consent form. You can change your deletion preference and future contact preference below.'
                        : `this allows us to use your anonymized gameplay data for research purposes.`}
                    {!!saveMutation.error && (
                        <span role="alert" className="block text-red-600">
                            Storing your participation choice failed
                        </span>
                    )}
                    {saveMutation.isSuccess && (
                        <span role="alert" className="block text-green-600">
                            Successfully stored your preferences
                            {hasIngameAuthCookie && 'you will be redirected to the login page now'}
                        </span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form>
                    <fieldset disabled={isMutating || (saveMutation.isSuccess && hasIngameAuthCookie)}>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id={id + 'keep-account'}
                                    checked={keepDataAfterStudyConducted}
                                    onCheckedChange={setKeepDataAfterStudyConducted}
                                />
                                <label
                                    htmlFor={id + 'keep-account'}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Keep my gameplay data and account after the study has been conduced, so I can
                                    continue to login and view my visualized gameplay.
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id={id + 'future-participate'}
                                    checked={futureContactOk}
                                    onCheckedChange={setFutureContactOk}
                                />
                                <label
                                    htmlFor={id + 'future-participate'}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    I consent to being contacted about potentially taking part in a follow-up user study
                                    evaluating the tool and its visualizations.
                                </label>
                            </div>
                        </div>
                    </fieldset>
                </form>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button
                    disabled={isMutating}
                    onClick={handleAccept}
                    variant={keepDataAfterStudyConducted ? 'default' : 'destructive'}
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
