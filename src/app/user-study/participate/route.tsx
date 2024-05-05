import { redirect } from 'next/navigation';
import { getParticipantIdFromCookie } from '../_utils';

export function GET() {
    const participantId = getParticipantIdFromCookie();

    if (participantId) {
        redirect(`/user-study/participate/${participantId}`);
    } else {
        redirect('/user-study/participate/time-slot');
    }
}
