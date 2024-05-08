import { z } from 'zod';

import { v4 as uuidv4 } from 'uuid';
import { raise } from '~/lib/utils/utils';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';
import { ingameAuth } from '~/server/db/schema';

import { and, eq, gte, isNull } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { COOKIE_NAME_INGAME_AUTH_URL_ID } from '~/lib/cookie-names';
import type { db } from '~/server/db';

function isMax10MinutesOld() {
    const someMinutesAgo = new Date(Date.now() - 1000 * 60 * 10);
    return gte(ingameAuth.createdAt, someMinutesAgo);
}

export async function getUserIdFromIngameSession(db_: typeof db, id: string) {
    return (
        (
            await db_.query.ingameAuth.findFirst({
                where: (ingameAuth, { eq }) => eq(ingameAuth.id, id),
                columns: {
                    userId: true,
                },
            })
        )?.userId ?? raise(new Error('Could not find session'))
    );
}

export const ingameAuthRouter = createTRPCRouter({
    init: publicProcedure
        .input(
            z.object({
                modVersion: z.string().optional().nullable(),
            }),
        )
        .mutation(async ({ ctx, input: _ }) => {
            const id = uuidv4();
            const urlId = uuidv4();
            await ctx.db.insert(ingameAuth).values({
                id,
                urlId,
                name: '',
            });

            return {
                id,
                urlId,
            };
        }),

    logout: publicProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
        const result = await ctx.db.delete(ingameAuth).where(and(eq(ingameAuth.id, input.id)));

        if (result.rowsAffected !== 1) {
            throw new Error('Session does not exist');
        }
    }),

    changeUrlId: publicProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
        const newUrlId = uuidv4();
        const result = await ctx.db
            .update(ingameAuth)
            .set({ urlId: newUrlId })
            .where(and(eq(ingameAuth.id, input.id), isNull(ingameAuth.userId), isMax10MinutesOld()));

        if (result.rowsAffected !== 1) {
            throw new Error('Session does not exist');
        }
        return newUrlId;
    }),

    removeUrlId: publicProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
        const result = await ctx.db
            .update(ingameAuth)
            .set({ urlId: null })
            .where(and(eq(ingameAuth.id, input.id), isNull(ingameAuth.userId), isMax10MinutesOld()));

        if (result.rowsAffected !== 1) {
            throw new Error('Session does not exist');
        }
    }),

    allowLogin: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
        const userId = ctx.session?.user?.id ?? raise(new Error('Not logged in'));
        const result = await ctx.db
            .update(ingameAuth)
            .set({ userId })
            .where(and(eq(ingameAuth.id, input.id), isNull(ingameAuth.userId), isMax10MinutesOld()));

        if (result.rowsAffected !== 1) {
            throw new Error('Unexpected session state');
        }

        cookies().delete(COOKIE_NAME_INGAME_AUTH_URL_ID);
    }),

    cancelLogin: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
        const result = await ctx.db
            .delete(ingameAuth)
            .where(and(eq(ingameAuth.id, input.id), isNull(ingameAuth.userId), isMax10MinutesOld()));

        if (result.rowsAffected !== 1) {
            throw new Error('Unexpected session state');
        }

        cookies().delete(COOKIE_NAME_INGAME_AUTH_URL_ID);
    }),

    getStatus: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
        const session = await ctx.db.query.ingameAuth.findFirst({
            where: (ingameAuth, { eq }) => eq(ingameAuth.id, input.id),
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

    getByUrlIdIfNew: publicProcedure.input(z.object({ urlId: z.string().uuid() })).query(async ({ ctx, input }) => {
        const session = await ctx.db.query.ingameAuth.findFirst({
            where: (ingameAuth, { eq, and }) => and(eq(ingameAuth.urlId, input.urlId), isMax10MinutesOld()),
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
export const dynamic = 'force-dynamic';
