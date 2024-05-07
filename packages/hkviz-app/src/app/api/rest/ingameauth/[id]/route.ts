import { type NextRequest } from 'next/server';
import { apiFromServer } from '~/trpc/from-server';

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
    return Response.json(await (await apiFromServer()).ingameAuth.getStatus({ id: params.id }));
};

export const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
    await (await apiFromServer()).ingameAuth.logout({ id: params.id });
    return Response.json({});
};
