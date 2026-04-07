import { redirect as redirectNative, RouterResponseInit } from '@solidjs/router';
import { UrlPath, urlPath } from './url';

export const redirect = import.meta.env.DEV
	? (to: UrlPath, init?: number | RouterResponseInit) => {
			urlPath(to); // validate URL path in dev
			return redirectNative(to, init);
		}
	: redirectNative;
