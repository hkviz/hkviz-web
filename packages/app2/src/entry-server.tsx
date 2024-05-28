// @refresh reload
import { createHandler, StartServer } from '@solidjs/start/server';
import { getCookie } from 'vinxi/http';
import { FaviconsHead } from './components/favicons-head';

export default createHandler(() => {
    const theme = getCookie('theme') === 'light' ? 'light' : 'dark';
    return (
        <StartServer
            document={({ assets, children, scripts }) => (
                <html lang="en">
                    <head>
                        <meta charset="utf-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <link rel="icon" href="/favicon.ico" />
                        {assets}
                        <FaviconsHead theme={theme} />
                    </head>
                    <body class={theme === 'dark' ? 'dark' : ''}>
                        <div id="app">{children}</div>
                        {scripts}
                    </body>
                </html>
            )}
        />
    );
});
