import { Button } from '@/components/ui/button';
import { Clock, FileCheck } from 'lucide-react';
import { type Metadata } from 'next';
import Link from 'next/link';
import { ContentCenterWrapper } from '~/app/_components/content-wrapper';
import { GradientSeparator } from '~/app/_components/gradient-separator';
import { MailLink, MailLinkUnstyled } from '~/app/_components/mail-link';
import { hkExperienceFinished } from '~/lib/types/hk-experience';
import { apiFromServer } from '~/trpc/from-server';
import { formatTimeZoneName, getGmtOffset } from '../time-slot/_timezone-name';
import { SetParticipantCookie } from './_cookie-setter';

export function generateMetadata({ params }: { params: { participantId: string } }): Metadata {
    return {
        title: 'Participate in the HKViz user study',
    };
}

export default async function UserStudyParticipatePage({
    params: { participantId },
}: {
    params: { participantId: string };
}) {
    const api = await apiFromServer();

    const participant = await api.participant.getByParticipantId({
        participantId,
    });

    if (participant == null) {
        return (
            <ContentCenterWrapper backgroundClassName="dark:opacity-40 opacity-20">
                <div className="mx-auto w-full max-w-[80ch] px-4 pt-8 text-center">
                    <h1 className="font-serif text-3xl font-bold">Participant not found</h1>
                    <p>
                        The participantion link seems to be invalid. If you need help, please contact me at <MailLink />{' '}
                        or via Discord @OliverGrack.
                    </p>
                </div>
            </ContentCenterWrapper>
        );
    }

    const timeSlot = await api.userStudyTimeSlot.findByParticipantId({
        participantId,
    });

    const hkExperience = await api.hkExperience.getFromParticipantId({
        participantId,
    });
    const demographics = await api.studyDemographics.getFromParticipantId({
        participantId,
    });
    const informedConsent = await api.userStudyInformedConsent.didAccept({
        participantId,
    });
    const hasFinishedForms =
        informedConsent && demographics != null && hkExperience != null && hkExperienceFinished(hkExperience);

    console.log(participant, timeSlot);
    const dateTimeStr = timeSlot
        ? Intl.DateTimeFormat(participant.locale ?? 'en-US', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: participant.timeZone ?? 'UTC',
          }).format(new Date(timeSlot.startAt))
        : null;

    return (
        <ContentCenterWrapper backgroundClassName="dark:opacity-40 opacity-20">
            <SetParticipantCookie participantId={participantId} />
            <div className="mx-auto w-full max-w-[80ch] px-4 pt-8 text-center">
                <GradientSeparator className="my-8" />

                {dateTimeStr != null ? (
                    <>
                        <p className="font-serif text-3xl font-bold">
                            Our call is scheduled for <br />
                            {dateTimeStr}
                            <br />
                        </p>
                        <span className="-mt-4 inline-block text-sm opacity-60">
                            {participant.timeZone != null ? formatTimeZoneName(participant.timeZone) : 'UTC'} (
                            {getGmtOffset(participant.timeZone ?? 'UTC')})
                        </span>
                    </>
                ) : (
                    <p className="font-serif text-3xl font-bold">
                        Thank you for participating. <br /> No time slot chosen yet.
                    </p>
                )}

                <GradientSeparator className="my-8" />

                <div className="flex flex-col gap-2">
                    <Button
                        asChild
                        variant="outline"
                        className="flex h-auto flex-row justify-start gap-4 py-4 text-left"
                    >
                        <Link href="/user-study/participate/time-slot">
                            <Clock className="h-8 w-8 shrink-0 stroke-1" />
                            {dateTimeStr != null ? 'Reschedule' : 'Select a time slot'}
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="outline"
                        className="flex h-auto flex-row justify-start gap-4 py-4 text-left"
                    >
                        <Link
                            href={
                                hasFinishedForms ? '/user-study/informed-consent' : '/user-study/flow/' + participantId
                            }
                        >
                            <FileCheck className="h-8 w-8 shrink-0 stroke-1" />
                            {hasFinishedForms ? (
                                <span>
                                    Thank you for already reading through the study information and answering questions!{' '}
                                    <br />
                                    <span className="opacity-60">
                                        Click here to read through the study information again.
                                    </span>
                                </span>
                            ) : (
                                <span>
                                    Consent to study procedure and answer a few questions about yourself <br />
                                    <span className="opacity-60">
                                        Please take around 5 minutes before our call for this.
                                    </span>
                                </span>
                            )}
                        </Link>
                    </Button>
                </div>

                <p className="pt-4">
                    For any questions, please contact me at{' '}
                    <MailLinkUnstyled className="underline hover:no-underline" mail="participate@hkviz.org" /> or via
                    Discord @OliverGrack.
                </p>
            </div>
        </ContentCenterWrapper>
    );
}
