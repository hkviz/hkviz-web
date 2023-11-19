import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';
import { ingameSession } from '~/server/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { raise } from '~/lib/utils';
import { and, eq, isNull } from 'drizzle-orm';

export const ingameSessionRouter = createTRPCRouter({
    init: publicProcedure.input(z.object({ name: z.string().max(255) })).mutation(async ({ ctx, input }) => {
        const id = uuidv4();
        await ctx.db.insert(ingameSession).values({
            id,
            name: input.name,
        });

        return {
            id,
        };
    }),

    allowLogin: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
        const userId = ctx.session?.user?.id ?? raise(new Error('Not logged in'));
        const result = await ctx.db
            .update(ingameSession)
            .set({ userId })
            .where(and(eq(ingameSession.id, input.id), isNull(ingameSession.userId)));

        if (result.rowsAffected !== 1) {
            throw new Error('Unexpected session state');
        }
    }),

    cancelLogin: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
        const result = await ctx.db
            .delete(ingameSession)
            .where(and(eq(ingameSession.id, input.id), isNull(ingameSession.userId)));

        console.log(result);
        if (result.rowsAffected !== 1) {
            throw new Error('Unexpected session state');
        }
    }),

    getStatus: publicProcedure.input(z.object({ id: z.string().max(255) })).query(async ({ ctx, input }) => {
        const session = await ctx.db.query.ingameSession.findFirst({
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
        });

        return session;
    }),
});
