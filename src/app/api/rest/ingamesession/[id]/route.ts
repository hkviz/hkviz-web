import { type NextRequest } from 'next/server';
import { apiFromServer } from '~/trpc/from-server';

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
    console.log(params);
    return Response.json(await (await apiFromServer()).ingameSession.getStatus({ id: params.id }));
};
