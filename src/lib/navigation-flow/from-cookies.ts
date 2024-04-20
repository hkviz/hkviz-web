import { cookies } from 'next/headers';
import { COOKIE_NAME_INGAME_AUTH_URL_ID, COOKIE_NAME_USER_STUDY_PARTICIPANT_ID } from '../cookie-names';
import { type NavigationFlow } from './type';

export function getNavigationFlowFromCookies(): NavigationFlow | null {
    const hasIngameAuthCookie = cookies().get(COOKIE_NAME_INGAME_AUTH_URL_ID) != null;
    if (hasIngameAuthCookie) {
        return 'ingame-auth';
    }
    const hsaUserStudyCookie = cookies().get(COOKIE_NAME_USER_STUDY_PARTICIPANT_ID) != null;
    if (hsaUserStudyCookie) {
        return 'user-study';
    }
    return null;
}
