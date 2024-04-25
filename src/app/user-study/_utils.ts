import { cookies } from 'next/headers';
import { z } from 'zod';
import { COOKIE_NAME_USER_STUDY_PARTICIPANT_ID } from '~/lib/cookie-names';

export function getParticipantIdFromCookie() {
    const value = cookies().get(COOKIE_NAME_USER_STUDY_PARTICIPANT_ID)?.value;
    if (value) {
        try {
            return z.string().uuid().parse(value);
        } catch (e) {
            return null;
        }
    } else {
        return null;
    }
}

export function deleteParticipantIdCookie() {
    cookies().delete(COOKIE_NAME_USER_STUDY_PARTICIPANT_ID);
}
