import NextAuth from 'next-auth';
import { type NextRequest } from 'next/server';

import { authOptions } from '~/server/auth';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const defaultNextAuthHandler = NextAuth(authOptions);

export const GET = async (req: NextRequest, reqExtras: { params: { nextauth: string[] } }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const responsePromise: Promise<Response> = defaultNextAuthHandler(req, reqExtras);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const paths = reqExtras.params.nextauth;

    if (paths[0] !== 'signin') return responsePromise;

    const response = await responsePromise;

    const html = await response.text();

    const bodySuffix = '</div></div></body></html>';

    const newHtml = html.replace(
        bodySuffix,
        `<div class="card">
            <p style="margin: 0; line-height: 1.35;">
                Your data is processed and stored according to our
                <a href="/privacy-policy" style="color: var(--brand-color); filter: brightness(1.25);">privacy policy</a>.
            </p>
        </div>` + bodySuffix,
    );

    return new Response(newHtml, {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
    });
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const POST = defaultNextAuthHandler;
