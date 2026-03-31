import { useLocation } from '../routing/AA';
import { UrlPath } from '../routing/url';

export function getLoginUrl(callbackUrl: UrlPath): UrlPath {
	return `/api/auth/signin?callbackUrl=${callbackUrl}`;
}

export function createLoginUrl(): () => UrlPath {
	const path = useLocation();
	return () => getLoginUrl(path.pathname);
}

export function createLogoutUrl(): () => UrlPath {
	return () => '/api/auth/signout';
}
