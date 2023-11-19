import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { ingameSession } from '~/server/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { raise } from '~/lib/utils';

export const ingameSessionRouter = createTRPCRouter({
    init: publicProcedure
        .meta({ openapi: { method: 'GET', path: '/ingame-sessions/init' } })
        .input(z.object({ name: z.string().max(255) }))
        .output(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const id = uuidv4();
            await ctx.db.insert(ingameSession).values({
                id,
                name: input.name,
            });

            return {
                id,
            };
        }),

    getStatus: publicProcedure.input(z.object({ id: z.string().max(255) })).query(async ({ ctx, input }) => {
        const session =
            (await ctx.db.query.ingameSession.findFirst({
                where: (ingameSession, { eq }) => eq(ingameSession.id, input.id),
                columns: {
                    id: true,
                    name: true,
                },
                with: {
                    user: {
                        columns: {
                            id: true,
                            name: true,
                        },
                    },
                },
            })) ?? raise(new Error('Not found'));

        return session;
    }),
});
