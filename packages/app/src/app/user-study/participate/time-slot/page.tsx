import { GradientSeparator } from '~/app/_components/gradient-separator';
import { HKVizText } from '~/app/_components/hkviz-text';
import { apiFromServer } from '~/trpc/from-server';
import { ContentWrapper } from '../../../../../../app2/src/components/content-wrapper';
import { getParticipantIdFromCookieOrSessionUser } from '../../_utils';
import { TimeSlotPicker } from './_timeslot-picker';
import { redirect } from 'next/navigation';
import { type Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Participate in the HKViz user study',
};

export default async function UserStudyParticipatePage() {
    const api = await apiFromServer();
    const participantId = await getParticipantIdFromCookieOrSessionUser();
    const hasParticipantId = participantId != null;
    const participant = hasParticipantId ? await api.participant.getByParticipantId({ participantId }) : null;
    const timeSlot = hasParticipantId ? await api.userStudyTimeSlot.findByParticipantId({ participantId }) : null;

    if (participant?.userStudyFinished) {
        redirect('/user-study/participate/' + participantId);
    }

    return (
        <ContentWrapper backgroundClassName="dark:opacity-40 opacity-20">
            <div className="mx-auto w-full max-w-[80ch] px-4 pt-8 text-center">
                <h1 className="font-serif text-3xl font-bold">
                    {hasParticipantId ? (
                        <>Pick a time slot and call option</>
                    ) : (
                        <>
                            Participate in the <HKVizText /> user study.
                        </>
                    )}
                </h1>
                <p>
                    Thank you for your interest in participating in the <HKVizText /> user study. Your participation is
                    very appreciated and helps me to improve the tool and publish a paper about player visualization in
                    Metroidvania games.
                </p>
                <GradientSeparator className="my-8" />
            </div>

            <div className="text-left">
                <TimeSlotPicker
                    hasParticipantCookie={hasParticipantId}
                    currentParticipant={participant}
                    currentTimeSlot={timeSlot}
                />
            </div>
        </ContentWrapper>
    );
}
