import { type NextRequest } from 'next/server';
import { apiFromServer } from '~/trpc/from-server';

export const POST = async (req: NextRequest) => {
    const body: unknown = await req.json();
    // will be parsed by zod, so ok to pass any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    await (await apiFromServer()).run.markUploadPartFinished(body as any);
    return Response.json({});
};
