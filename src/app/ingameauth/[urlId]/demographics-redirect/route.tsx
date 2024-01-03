import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';
import { apiFromServer } from '~/trpc/from-server';

export const GET = async (req: NextRequest, { params: { urlId } }: { params: { urlId: string } }) => {
    const ingameAuth = await (await apiFromServer()).ingameAuth.getByUrlIdIfNew({ urlId });

    if (!ingameAuth || ingameAuth.user) {
        return new Response('This login link does not exist', { status: 404 });
    }

    const newUrlId = await (await apiFromServer()).ingameAuth.changeUrlId({ id: ingameAuth.id });
    cookies().set('ingameAuthUrlId', newUrlId);

    redirect('/study-demographic-form');
};
