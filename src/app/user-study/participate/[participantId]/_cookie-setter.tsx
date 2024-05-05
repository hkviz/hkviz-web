'use client';

import { useEffect } from 'react';
import { createCookieFromClient } from '~/lib/client-cookies';
import { COOKIE_NAME_USER_STUDY_PARTICIPANT_ID } from '~/lib/cookie-names';

export function SetParticipantCookie({ participantId }: { participantId: string }) {
    useEffect(() => {
        createCookieFromClient(COOKIE_NAME_USER_STUDY_PARTICIPANT_ID, participantId, 365);
    }, [participantId]);
    return undefined;
}
