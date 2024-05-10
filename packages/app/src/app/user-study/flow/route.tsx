import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { hkExperienceFinished } from '~/lib/types/hk-experience';
import { getServerAuthSession } from '~/server/auth';
import { apiFromServer } from '~/trpc/from-server';
import { deleteFlowCookie, getParticipantIdFromCookieOrSessionUser, setFlowCookie } from '../_utils';

export const GET = async () => {
    const participantId = await getParticipantIdFromCookieOrSessionUser();
    setFlowCookie('user-study');
    if (!participantId) {
        return new Response('No participant ID found', { status: 400 });
    }

    const session = await getServerAuthSession();
    const userId = session?.user?.id ?? null;

    const api = await apiFromServer();

    const exists = await api.participant.existsAndStoreUserId({ participantId, userId });

    if (!exists) {
        return new Response('This participation link does not exist', { status: 404 });
    }

    if (!(await api.userStudyInformedConsent.didAccept({ participantId }))) {
        redirect('/user-study/informed-consent');
    }

    const userDemographics = await api.studyDemographics.getFromParticipantId({ participantId });
    if (!userDemographics) {
        redirect('/study-demographic-form');
    }

    const hkExperience = await api.hkExperience.getFromParticipantId({ participantId });
    if (!hkExperience || !hkExperienceFinished(hkExperience)) {
        redirect('/experience');
    }

    revalidatePath('/user-study/participate/[id]', 'page');
    revalidatePath('/user-study/informed-consent', 'page');
    revalidatePath('/experience', 'page');

    deleteFlowCookie();
    redirect('/user-study/done');
};
