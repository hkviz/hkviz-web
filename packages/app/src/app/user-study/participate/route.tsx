import { redirect } from 'next/navigation';
import { getParticipantIdFromCookieOrSessionUser } from '../_utils';

export async function GET() {
    const participantId = await getParticipantIdFromCookieOrSessionUser();

    if (participantId) {
        redirect(`/user-study/participate/${participantId}`);
    } else {
        redirect('/user-study/participate/time-slot');
    }
}
