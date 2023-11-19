import { type NextRequest } from 'next/server';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '~/server/db';
import { ingameSession } from '~/server/db/schema';

const paramsSchema = z.object({ name: z.string().max(255) });

export const POST = async (req: NextRequest) => {
    const body: unknown = await req.json();
    const data = paramsSchema.parse(body);

    const id = uuidv4();
    await db.insert(ingameSession).values({
        id,
        name: data.name,
    });

    return Response.json({
        id,
    });
};
