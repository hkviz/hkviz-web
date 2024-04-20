import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';
import { COOKIE_NAME_INGAME_AUTH_URL_ID, COOKIE_NAME_USER_STUDY_PARTICIPANT_ID } from '~/lib/cookie-names';
import { getServerAuthSession } from '~/server/auth';
import { apiFromServer } from '~/trpc/from-server';

export const GET = async (req: NextRequest, { params: { participantId } }: { params: { participantId: string } }) => {
    const api = await apiFromServer();

    if (!(await api.participant.exists({ participantId }))) {
        return new Response('404: This participation link does not exist', { status: 404 });
    }

    // clearing the ingameAuthUrlId cookie here, so other pages dont redirect to ingame auth
    cookies().delete(COOKIE_NAME_INGAME_AUTH_URL_ID);
    cookies().set(COOKIE_NAME_USER_STUDY_PARTICIPANT_ID, participantId);

    const session = await getServerAuthSession();
    const userId = session?.user?.id ?? null;

    if (!userId) {
        // give option to login or continue without login
        redirect('/user-study/participate');
    } else {
        // already logged in
        redirect('/user-study/flow');
    }
};
