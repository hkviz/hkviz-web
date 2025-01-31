// @refresh reload
import { createHandler, StartServer } from '@solidjs/start/server';
import { FaviconsHead } from './components/favicons-head';
import { serverCookiesGetSyncDontUse } from './lib/cookies/cookies-server';
import { COOKIE_THEME } from './lib/cookies/cookie-names';

const jsonLd = JSON.stringify({
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	url: 'https://www.hkviz.org',
	name: 'HKViz',
});

export default createHandler(() => {
	return (
		<StartServer
			document={({ assets, children, scripts }) => {
				const theme = serverCookiesGetSyncDontUse().getSafe(COOKIE_THEME);

				return (
					<html lang="en">
						<head>
							<meta charset="utf-8" />
							<meta name="viewport" content="width=device-width, initial-scale=1" />
							<link rel="icon" href="/favicon.ico" />
							{/* eslint-disable-next-line solid/no-innerhtml */}
							<script type="application/ld+json" innerHTML={jsonLd} />
							<FaviconsHead theme={theme} />
							{assets}
						</head>
						<body class={theme === 'dark' ? 'dark' : ''}>
							<div id="app">{children}</div>
							{scripts}
						</body>
					</html>
				);
			}}
		/>
	);
});
