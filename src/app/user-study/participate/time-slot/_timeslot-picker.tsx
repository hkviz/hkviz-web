'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToast } from '@/components/ui/use-toast';
import { useSignal } from '@preact/signals-react';
import { useSignals } from '@preact/signals-react/runtime';
import * as d3 from 'd3';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { z } from 'zod';
import { BottomInteractionRow, BottomInteractionRowText } from '~/app/_components/bottom_interaction';
import { GradientSeparator } from '~/app/_components/gradient-separator';
import { MailLinkUnstyled } from '~/app/_components/mail-link';
import { callOptions, type CallOptionCode } from '~/lib/types/call-option';
import { api } from '~/trpc/react';
import { type RouterOutputs } from '~/trpc/shared';
import { revalidatePathFromClient } from './_invalidate-tag';
import { TimezoneSelect } from './_timezone-select';

export function TimeSlotPicker({
    hasParticipantCookie,
    currentTimeSlot,
    currentParticipant,
}: {
    hasParticipantCookie: boolean;
    currentTimeSlot: RouterOutputs['userStudyTimeSlot']['findByParticipantId'];
    currentParticipant: RouterOutputs['participant']['getByParticipantId'];
}) {
    useSignals();
    const timeSlotsQuery = api.userStudyTimeSlot.findAllVisible.useQuery();
    const timeSlots = timeSlotsQuery.data;

    const { toast, dismiss } = useToast();

    const [timeZone, setTimeZone] = useState(currentParticipant?.timeZone ?? '');
    const [callOption, setCallOption] = useState<CallOptionCode>(currentParticipant?.callOption ?? 'zoom');

    useEffect(() => {
        setTimeZone((timeZone) => timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
    }, []);

    const zonedTimeSlots = useMemo(
        () =>
            timeZone
                ? timeSlots?.map((slot) => {
                      const startAt = new Date(slot.startAt);
                      return {
                          id: slot.id,
                          idStr: slot.id.toString(),
                          free: slot.free,
                          day: startAt.toLocaleDateString(undefined, {
                              timeZone,
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                          }),
                          time: startAt.toLocaleTimeString(undefined, { timeZone, hour: '2-digit', minute: '2-digit' }),
                      };
                  })
                : undefined,
        [timeSlots, timeZone],
    );

    const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string | null>(
        currentTimeSlot?.id?.toString?.() ?? null,
    );
    const selectedTimeSlot = useMemo(() => {
        if (zonedTimeSlots == null || selectedTimeSlotId == null) return null;
        return zonedTimeSlots.find((d) => d.idStr === selectedTimeSlotId) ?? null;
    }, [zonedTimeSlots, selectedTimeSlotId]);

    const groupedTimeSlots = useMemo(() => {
        if (!zonedTimeSlots) return undefined;
        return [...d3.group(zonedTimeSlots, (d) => d.day).entries()];
    }, [zonedTimeSlots]);

    const callOptionInputRef = useRef<HTMLInputElement>(null);
    const continueButtonRef = useRef<HTMLButtonElement>(null);
    const firstTimeSlotRef = useRef<HTMLButtonElement>(null);

    const contactName = useSignal(currentParticipant?.callName ?? '');
    const router = useRouter();

    const bookMutation = api.userStudyTimeSlot.book.useMutation({
        onError(error) {
            void timeSlotsQuery.refetch();
            toast({ title: 'An error occurred while booking the time slot.' + error.message });
        },
        async onSuccess(participantId) {
            if (participantId === false) {
                void timeSlotsQuery.refetch();
                toast({
                    title: 'Ohh no, this time slot just has been booked by somebody else. Please pick another one.',
                });
                setSelectedTimeSlotId(null);

                void timeSlotsQuery.refetch();
                return;
            }
            await revalidatePathFromClient([
                '/user-study/participate/' + participantId,
                'user-study/participate/time-slot',
                'user-study/participate',
            ]);
            router.push('/user-study/participate/' + participantId);
        },
    });

    function book() {
        const _contactName = contactName.value;
        if (!_contactName) {
            callOptionInputRef.current?.focus();
            toast({ title: 'Please enter your contact information.' });
            return;
        }
        if (callOption === 'zoom' && !z.string().email().safeParse(_contactName).success) {
            callOptionInputRef.current?.focus();
            toast({ title: 'Please enter a valid email address.' });
            return;
        }

        if (!selectedTimeSlot) {
            firstTimeSlotRef.current?.focus();
            toast({ title: 'Please select a time-slot.' });
            return;
        }

        bookMutation.mutate({
            id: selectedTimeSlot.id,
            callOption,
            callName: _contactName,
            timeZone,
            locale: Intl.DateTimeFormat().resolvedOptions().locale,
        });
    }

    return (
        <fieldset disabled={bookMutation.isSuccess || bookMutation.isLoading}>
            <div className="mx-auto w-full max-w-[80ch] px-4 pb-4 text-center">
                <h2 className="font-serif text-xl font-bold">1. Call option</h2>
                <p>
                    For the 30 minute session, I will either call you via Zoom or Discord, depending on your preference.
                    Your contact info is deleted once the study is conducted.
                </p>
                <div className="pt-4">
                    <ToggleGroup
                        type="single"
                        value={callOption}
                        onValueChange={(v) => {
                            setCallOption((v as CallOptionCode) || callOption);
                            if (callOptionInputRef.current) {
                                callOptionInputRef.current.focus();
                                callOptionInputRef.current.value = '';
                                contactName.value = '';
                            }
                            dismiss();
                        }}
                    >
                        {callOptions.map((it) => (
                            <ToggleGroupItem value={it.code} variant="outline" key={it.code}>
                                {it.name}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>
                <div className="mx-auto max-w-[30ch] py-4">
                    <Input
                        autoFocus
                        required
                        type={callOption === 'discord' ? 'text' : 'email'}
                        placeholder={callOption === 'discord' ? 'Your discord username' : 'Your email'}
                        ref={callOptionInputRef}
                        onBlur={(e) => {
                            e.currentTarget.value = e.currentTarget.value.trim();
                            void timeSlotsQuery.refetch();
                        }}
                        onInput={(e) => {
                            contactName.value = e.currentTarget.value;
                            dismiss();
                        }}
                        defaultValue={contactName.peek()}
                        maxLength={callOption === 'discord' ? 32 : undefined}
                    />
                    {callOption === 'discord' && (
                        <p className="pt-2 text-left text-sm opacity-70">
                            You will be contacted by a user named @OliverGrack. Please make sure to accept the friend
                            request, so I can call you. You can remove me from your friends list after the study is
                            over.
                        </p>
                    )}
                    {callOption === 'zoom' && (
                        <p className="pt-2 text-left text-sm opacity-70">
                            A zoom link will be sent to the email address you provide.
                        </p>
                    )}
                </div>

                <GradientSeparator className="my-8" />
                <h2 className="font-serif text-xl font-bold">2. When should the call start?</h2>
                <p>
                    If none of these times work for you, we can probably find a different one. Just let me know via{' '}
                    <MailLinkUnstyled
                        className="text-inherit underline hover:no-underline"
                        mail="participate@hkviz.org"
                    />{' '}
                    or via Discord @OliverGrack.
                </p>
                <div className="flex flex-col gap-2 pt-4 text-left">
                    {timeSlotsQuery.data && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Timezone</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <TimezoneSelect value={timeZone} onChange={setTimeZone} />
                                </CardContent>
                            </Card>
                            {groupedTimeSlots?.map(([group, slots], groupIndex) => (
                                <Card key={group}>
                                    <CardHeader>
                                        <CardTitle>{group}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ToggleGroup
                                            type="single"
                                            className="flex-wrap justify-start"
                                            value={selectedTimeSlot?.day === group ? selectedTimeSlot.idStr : 'none'}
                                            onValueChange={(value) => {
                                                setSelectedTimeSlotId(value ?? null);
                                                continueButtonRef.current?.focus();
                                                dismiss();
                                            }}
                                        >
                                            {slots.map((slot, slotIndex) => (
                                                <ToggleGroupItem
                                                    key={slot.id}
                                                    value={slot.idStr}
                                                    variant="outline"
                                                    ref={
                                                        groupIndex === 0 && slotIndex === 0
                                                            ? firstTimeSlotRef
                                                            : undefined
                                                    }
                                                >
                                                    {slot.time.toString()}
                                                </ToggleGroupItem>
                                            ))}
                                        </ToggleGroup>
                                    </CardContent>
                                </Card>
                            ))}
                        </>
                    )}
                    {!timeSlotsQuery.data && (
                        <>
                            <Skeleton className="h-36 w-full border bg-card" />
                            <Skeleton className="h-44 w-full border bg-card" />
                            <Skeleton className="h-44 w-full border bg-card" />
                        </>
                    )}
                </div>
            </div>
            <BottomInteractionRow>
                <BottomInteractionRowText>Select a call option and time slot to continue.</BottomInteractionRowText>
                <Button onClick={() => book()} ref={continueButtonRef}>
                    {hasParticipantCookie ? 'Pick time slot' : 'Participate'}
                </Button>
            </BottomInteractionRow>
        </fieldset>
    );
}
