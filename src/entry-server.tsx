// @refresh reload
import { createHandler, StartServer } from '@solidjs/start/server';
import { FaviconsHead } from './components/favicons-head';
import { serverCookiesGetSyncDontUse } from './lib/cookies/cookies-server';

export default createHandler(() => {
	return (
		<StartServer
			document={({ assets, children, scripts }) => {
				const theme = serverCookiesGetSyncDontUse().get('theme') === 'light' ? 'light' : 'dark';

				return (
					<html lang="en">
						<head>
							<meta charset="utf-8" />
							<meta name="viewport" content="width=device-width, initial-scale=1" />
							<link rel="icon" href="/favicon.ico" />
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
