import { redirect } from '@solidjs/router';
import { createMiddleware } from '@solidjs/start/middleware';

const oldUrls = [
	// production
	'https://hkviz.olii.dev',
	// for local testing uncomment
	// 'http://localhost:3000',
];

export default createMiddleware({
	onRequest: [
		(event) => {
			const url = event.request.url;

			for (const oldUrl of oldUrls) {
				if (url.includes(oldUrl) && !url.includes('api') && !url.includes('o=o')) {
					// don't redirect api calls, since these are used by old mod versions.
					const newUrl = url.replace(oldUrl, 'https://www.hkviz.org');
					return redirect(newUrl, {
						status: 301,
					});
				}
			}
		},
	],
});
