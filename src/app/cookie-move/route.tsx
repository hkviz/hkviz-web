import { cookies } from 'next/headers';

const allowedOrigin = 'https://www.hkviz.org';

export function GET() {
    const nextAuthSessionToken = cookies().get('next-auth.session-token')?.value;

    const data = { nextAuthSessionToken };

    const content = nextAuthSessionToken
        ? `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="utf-8" />
                </head>
                <body>
                    <script>
                        const data = ${JSON.stringify(data)};
                        window.top.postMessage(data, '${allowedOrigin}');
                    </script>
                </body>
            </html>
            `
        : ``;
    return new Response(content);
}
