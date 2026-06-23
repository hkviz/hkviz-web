import { redirect } from '@solidjs/router';
import { createMiddleware } from '@solidjs/start/middleware';
import { env } from './env';
import { getMaintenanceModeResponse } from './maintenance-mode';

const oldUrl = 'https://hkviz.olii.dev';

export default createMiddleware({
	onRequest: [
		(event) => {
			// console.log('middleware', event);
			const url = event.request.url;

			if (env.MAINTENANCE_MODE) {
				return getMaintenanceModeResponse();
			}

			if (url.startsWith(oldUrl) && !url.includes('api') && !url.includes('_server') && !url.includes('o=o')) {
				// don't redirect api calls, since these are used by old mod versions.
				const newUrl = url.replace(oldUrl, 'https://hkviz.org');
				return redirect(newUrl, {
					status: 301,
				});
			}
			return undefined;
		},
	],
});
