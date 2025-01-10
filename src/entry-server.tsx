// @refresh reload
import { createHandler, StartServer } from '@solidjs/start/server';
import { FaviconsHead } from './components/favicons-head';

export default createHandler(() => (
	<StartServer
		document={({ assets, children, scripts }) => (
			<html lang="en">
				<head>
					<meta charset="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<link rel="icon" href="/favicon.ico" />
					{/* todo use theme from cookie */}
					<FaviconsHead theme="dark" />
					{assets}
				</head>
				<body class="dark">
					<div id="app">{children}</div>
					{scripts}
				</body>
			</html>
		)}
	/>
));
