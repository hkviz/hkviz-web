import type { RouterResponseInit } from '@solidjs/router';
import { redirect as redirectNative } from '@solidjs/router';
import type { UrlPath} from './url';
import { urlPath } from './url';

export const redirect = import.meta.env.DEV
	? (to: UrlPath, init?: number | RouterResponseInit) => {
			urlPath(to); // validate URL path in dev
			return redirectNative(to, init);
		}
	: redirectNative;
