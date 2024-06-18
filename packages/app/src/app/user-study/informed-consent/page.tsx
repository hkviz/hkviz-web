import { cookies } from 'next/headers';
import { z } from 'zod';
import { BottomInteractionRow, BottomInteractionRowText } from '~/app/_components/bottom_interaction';
import { MdxInnerWrapper, MdxOuterWrapper } from '../../../../../app2/src/components/mdx-layout';
import { COOKIE_NAME_USER_STUDY_PARTICIPANT_ID } from '~/lib/cookie-names';
import { apiFromServer } from '~/trpc/from-server';
import { UserStudyInformedConsentAcceptButton } from './_client-form';
import MdxContent from './_page.mdx';

export default async function UserStudyInformedConsentPage() {
    const api = await apiFromServer();

    const participantId = z.string().uuid().parse(cookies().get(COOKIE_NAME_USER_STUDY_PARTICIPANT_ID)?.value);
    const didAccept = await api.userStudyInformedConsent.didAccept({ participantId });

    return (
        <MdxOuterWrapper>
            <MdxInnerWrapper>
                <MdxContent />
            </MdxInnerWrapper>

            <BottomInteractionRow>
                <BottomInteractionRowText>
                    {didAccept
                        ? 'You have agreed to the informed consent.'
                        : 'Agree to the informed consent form to continue.'}
                </BottomInteractionRowText>

                {!didAccept && <UserStudyInformedConsentAcceptButton participantId={participantId} />}
            </BottomInteractionRow>
        </MdxOuterWrapper>
    );
}
