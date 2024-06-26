import { useLocation } from '@solidjs/router';

export function getLoginUrl(callbackUrl: string) {
    return '/api/auth/signin?callbackUrl=' + callbackUrl;
}

export function createLoginUrl() {
    const path = useLocation();
    return () => getLoginUrl(path.pathname);
}

export function createLogoutUrl() {
    return () => '/api/auth/signout';
}
