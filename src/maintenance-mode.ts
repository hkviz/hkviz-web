export function getMaintenanceModeResponse() {
	return new Response(
		`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <title>HKViz - Under maintenance</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f0f0f0;
                        color: #333;
                    }
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    h1 {
                        font-size: 2em;
                    }
                    p {
                        font-size: 1.2em;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>HKViz is under maintenance</h1>
                    <p>
                        It will be back shortly. 
                        For infos check the Utility > #hkviz channel in the <a href="https://discord.gg/VDsg3HmWuB">Hollow Knight Modding Discord Server</a>.
                    </p>

                    <p>
                        While in maintenance mode, the mod may display errors. These should automatically resolve themselves once the website is back online.
                    </p>
                </div>
            </body>
        </html>
        `,
		{
			status: 503,
			headers: {
				'Content-Type': 'text/html',
				'Cache-Control': 'no-store',
			},
			statusText: 'Service Unavailable',
		},
	);
}
