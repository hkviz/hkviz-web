import { SolidAuth } from '@solid-mediakit/auth';
import { authOptions } from '~/server/auth';
import { type APIEvent, type APIHandler } from '@solidjs/start/server';

const { GET: defaultGet, POST: defaultPost } = SolidAuth(authOptions);

export const POST = defaultPost;
export const GET: APIHandler = async (event) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const responsePromise: Promise<Response> = defaultGet(event);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const paths = event.params.solidauth;

    if (paths !== 'signin') return responsePromise;

    const response = await responsePromise;

    const html = await response.text();

    const bodySuffix = '</div></div></body></html>';

    const newHtml = html
        .replace(
            bodySuffix,
            `<div class="card">
            <p style="margin: 0; line-height: 1.35;">
                Your data is processed and stored according to our
                <a href="/privacy-policy" style="color: var(--brand-color); filter: brightness(1.25);">privacy policy</a>.
            </p>
        </div>` + bodySuffix,
        )
        .replace('Sign in with Nodemailer', 'Sign in with Email');

    return new Response(newHtml, {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
    });
};
