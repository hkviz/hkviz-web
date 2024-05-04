import { GradientSeparator } from '~/app/_components/gradient-separator';
import { HKVizText } from '~/app/_components/hkviz-text';
import { ContentWrapper } from '../../_components/content-wrapper';
import { TimeSlotPicker } from './_timeslots/timeslot-picker';

export default function UserStudyParticipatePage() {
    return (
        <ContentWrapper backgroundClassName="dark:opacity-40 opacity-20">
            <div className="mx-auto w-full max-w-[80ch] px-4 pt-8 text-center">
                <h1 className="font-serif text-3xl font-bold">
                    Participate in the <HKVizText /> user study.
                </h1>
                <p>
                    Thank you for your interest in participating in the <HKVizText /> user study. Your participation is
                    very appreciated and helps me to improve the tool and publish a paper about player visualization in
                    Metroidvania games.
                </p>
                <GradientSeparator className="my-8" />
            </div>

            <div className="text-left">
                <TimeSlotPicker />
            </div>
        </ContentWrapper>
    );
}
