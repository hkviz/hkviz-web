import { cookies } from 'next/headers';
import { z } from 'zod';
import { COOKIE_NAME_CURRENT_FLOW, COOKIE_NAME_USER_STUDY_PARTICIPANT_ID } from '~/lib/cookie-names';
import { type NavigationFlow } from '~/lib/navigation-flow/type';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

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

export async function getParticipantIdFromCookieOrSessionUser() {
    const fromCookie = getParticipantIdFromCookie();
    if (fromCookie) {
        return fromCookie;
    }
    const session = await getServerAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
        return null;
    }
    const user = await db.query.users.findFirst({
        where: (user, { eq }) => eq(user.id, userId),
        columns: {
            participantId: true,
        },
    });
    return user?.participantId ?? null;
}

export function deleteFlowCookie() {
    cookies().delete(COOKIE_NAME_CURRENT_FLOW);
}

export function setFlowCookie(flow: NavigationFlow) {
    cookies().set(COOKIE_NAME_CURRENT_FLOW, flow);
}
