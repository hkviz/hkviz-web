import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { runInteraction, runs } from '~/server/db/schema';
import { createTRPCRouter, protectedProcedure } from '../../trpc';

export const runInteractionRouter = createTRPCRouter({
    like: protectedProcedure
        .input(
            z.object({
                runId: z.string().uuid(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db.transaction(async (db) => {
                const run = await db.query.runs.findFirst({
                    where: eq(runs.id, input.runId),
                    columns: { id: true },
                });
                if (!run) {
                    throw new Error('Run not found');
                }

                const userId = ctx.session.user.id;

                const existing = await db.query.runInteraction.findFirst({
                    where: (runInteraction, { eq, and }) =>
                        and(
                            eq(runInteraction.userId, userId),
                            eq(runInteraction.runId, input.runId),
                            eq(runInteraction.type, 'like'),
                        ),
                });

                if (existing) return;

                const result = await db.insert(runInteraction).values({
                    userId,
                    runId: input.runId,
                    type: 'like',
                    originalRunIds: [input.runId],
                });
                if (result.rowsAffected !== 1) {
                    console.error('Failed to like run', input.runId, userId, result.rowsAffected);
                }
                if (result.rowsAffected !== 0) {
                    await db
                        .update(runs)
                        .set({ likeCount: sql`${runs.likeCount} + ${result.rowsAffected}` })
                        .where(eq(runs.id, input.runId));
                }
            });
        }),
    unlike: protectedProcedure
        .input(
            z.object({
                runId: z.string().uuid(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db.transaction(async (db) => {
                const run = await db.query.runs.findFirst({
                    where: eq(runs.id, input.runId),
                    columns: { id: true },
                });
                if (!run) {
                    throw new Error('Run not found');
                }

                const userId = ctx.session.user.id;
                const result = await db
                    .delete(runInteraction)
                    .where(
                        and(
                            eq(runInteraction.userId, userId),
                            eq(runInteraction.runId, input.runId),
                            eq(runInteraction.type, 'like'),
                        ),
                    );

                if (result.rowsAffected > 1) {
                    console.error('Deleted more than one like', input.runId, userId, result.rowsAffected);
                }
                if (result.rowsAffected !== 0) {
                    await db
                        .update(runs)
                        .set({ likeCount: sql`${runs.likeCount} - ${result.rowsAffected}` })
                        .where(eq(runs.id, input.runId));
                }
            });
        }),
});
