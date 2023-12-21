import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { sendMailToSupport } from '~/lib/mails';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { accountDeletionRequest } from '~/server/db/schema';

export const accountRouter = createTRPCRouter({
    initiateAccountRemovalRequest: protectedProcedure.mutation(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;
        const id = uuidv4();

        await ctx.db.insert(accountDeletionRequest).values({
            id,
            userId,
            createdAt: new Date(),
        });

        return id;
    }),
    cancelAccountRemovalRequest: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const result = await ctx.db
                .delete(accountDeletionRequest)
                .where(and(eq(accountDeletionRequest.id, input.id), eq(accountDeletionRequest.userId, userId)));

            if (result.rowsAffected === 0) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Account deletion request not found',
                });
            }
        }),
    acceptAccountRemovalRequest: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const result = await ctx.db
                .update(accountDeletionRequest)
                .set({ formAccepted: true })
                .where(and(eq(accountDeletionRequest.id, input.id), eq(accountDeletionRequest.userId, userId)));

            if (result.rowsAffected === 0) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Account deletion request not found',
                });
            }

            await sendMailToSupport({
                subject: 'Deletion request',
                text: `Deletion request form user ${userId} accepted. Please delete all data of this user.`,
                html: `Deletion request form user <b>${userId}</b> accepted. Please delete all data of this user.`,
            });
        }),
});
