import { type NextRequest } from 'next/server';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '~/server/db';
import { ingameAuth } from '~/server/db/schema';
import { apiFromServer } from '~/trpc/from-server';

export const POST = async (req: NextRequest) => {
    const body: unknown = await req.json();
    // will be parsed by zod, so ok to pass any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    return Response.json(await (await apiFromServer()).ingameAuth.init(body as any));
};
