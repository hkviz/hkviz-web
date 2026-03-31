export function hkVizUrl(path: UrlPath | '' = ''): string {
	return `https://www.hkviz.org${path}`;
}

export type FormerHkVizUrl = '/research' | 'getting-started';

export type GuideUrlPath = '/guide/install' | '/guide/analytics';

export type IngameAuthUrlPath = `/ingameauth/flow/${string}`;

export type UrlPath =
	| '/'
	| '/run'
	| `/run/${string}`
	| `/player/${string}`
	| GuideUrlPath
	| '/publications'
	| '/privacy-policy'
	| '/changelog'
	| '/settings'
	| '/settings/account-deletion'
	| '/settings/account-deletion/cancel-success'
	| '/settings/account-deletion/cancel-error'
	| '/archive'
	| '/credits'
	| IngameAuthUrlPath
	| `/api/auth/${string}`;

export type UrlPathPartial = UrlPath | `/guide` | `/player`;

export function urlPath(path: UrlPath): UrlPath {
	if (import.meta.env.DEV) {
		const valid = isUrlPath(path);

		if (!valid) {
			throw new Error(`Invalid URL path: ${path}`);
		}
	}

	return path;
}

export function urlPathPartial(path: UrlPathPartial): UrlPathPartial {
	return path;
}

export function isRunUrl(path: UrlPath): path is `/run/${string}` {
	return path.startsWith('/run/');
}

export function isPlayerUrl(path: UrlPath): path is `/player/${string}` {
	return path.startsWith('/player/');
}

export function isGuideUrl(path: UrlPath): path is GuideUrlPath {
	return path.startsWith('/guide/');
}

export function isUrlPath(path: string): path is UrlPath {
	return (
		path === '/' ||
		path === '/run' ||
		path.startsWith('/run/') ||
		path.startsWith('/player/') ||
		path.startsWith('/guide/') ||
		path === '/publications' ||
		path === '/privacy-policy' ||
		path === '/changelog' ||
		path === '/settings' ||
		path === '/settings/account-deletion' ||
		path === '/settings/account-deletion/cancel-success' ||
		path === '/settings/account-deletion/cancel-error' ||
		path === '/archive' ||
		path === '/credits' ||
		path.startsWith('/ingameauth/flow/') ||
		path.startsWith('/api/auth/')
	);
}
