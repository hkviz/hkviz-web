import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';
import { COOKIE_NAME_INGAME_AUTH_URL_ID } from '~/lib/cookie-names';
import { apiFromServer } from '~/trpc/from-server';

export const GET = async (_req: NextRequest, { params: { urlId } }: { params: { urlId: string } }) => {
    const ingameAuth = await (await apiFromServer()).ingameAuth.getByUrlIdIfNew({ urlId });

    if (!ingameAuth || ingameAuth.user) {
        return new Response('This login link does not exist', { status: 404 });
    }

    const newUrlId = await (await apiFromServer()).ingameAuth.changeUrlId({ id: ingameAuth.id });
    cookies().set(COOKIE_NAME_INGAME_AUTH_URL_ID, newUrlId);

    redirect('/study-demographic-form');
};
