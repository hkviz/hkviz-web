import { cookies } from 'next/headers';
import { COOKIE_NAME_CURRENT_FLOW, COOKIE_NAME_INGAME_AUTH_URL_ID } from '../cookie-names';
import { type NavigationFlow } from './type';

export function getNavigationFlowFromCookies(): NavigationFlow | null {
    const flowCookie = cookies().get(COOKIE_NAME_CURRENT_FLOW)?.value;
    if (flowCookie) {
        return flowCookie as NavigationFlow;
    }

    const hasIngameAuthCookie = cookies().get(COOKIE_NAME_INGAME_AUTH_URL_ID) != null;
    if (hasIngameAuthCookie) {
        return 'ingame-auth';
    }
    return null;
}
