import { redirect } from 'next/navigation';
import { getServerAuthSession } from '~/server/auth';
import { apiFromServer } from '~/trpc/from-server';
import { deleteParticipantIdCookie, getParticipantIdFromCookie } from '../_utils';

export const GET = async () => {
    const participantId = getParticipantIdFromCookie();
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
    if (!hkExperience) {
        redirect('/experience');
    }

    deleteParticipantIdCookie();
    redirect('/user-study/done');
};
