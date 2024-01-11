import { TRPCError } from '@trpc/server';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { sendMailToSupport } from '~/lib/mails';
import { r2DeleteFile, r2RunPartFileKey } from '~/lib/r2';
import { runFiles, runs } from '~/server/db/schema';
import { protectedProcedure } from '../../trpc';

export const deleteRunProcedure = protectedProcedure
    .input(z.object({ runId: z.string() }))
    .mutation(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;

        const deletionId = uuidv4();

        // first set deleted flag for run, so even if it fails, the run can be deleted later
        const result = await ctx.db
            .update(runs)
            // the local id is changed, since when deletion fails, the run would persist
            // and the local id would be found when uploading to the run again
            // instead, by changing it, a new run is created if there are new parts.
            .set({ deleted: true, localId: sql`CONCAT(${deletionId}, ${runs.localId})` })
            .where(and(eq(runs.id, input.runId), eq(runs.userId, userId)));

        if (result.rowsAffected === 0)
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Run not found while setting deleted' });

        try {
            const files = await ctx.db.query.runFiles.findMany({
                where: (runFiles, { and, eq }) => and(eq(runFiles.runId, input.runId)),
                columns: {
                    id: true,
                },
            });

            const deletionResults = await Promise.allSettled(files.map((it) => r2DeleteFile(r2RunPartFileKey(it.id))));
            const successfullyDeleted = deletionResults
                .map((it, i) => (it.status === 'fulfilled' ? files[i] : null))
                .filter((it): it is (typeof files)[0] => it !== null);

            const allFilesDeletedSuccess = successfullyDeleted.length === files.length;

            // only the runfile parts where the r2 file was deleted successfully are deleted from the db
            // so the other parts can easily be retried
            await ctx.db.delete(runFiles).where(
                and(
                    eq(runFiles.runId, input.runId),
                    inArray(
                        runFiles.id,
                        successfullyDeleted.map((it) => it.id),
                    ),
                ),
            );

            // if not all files were deleted, the run is not deleted
            if (allFilesDeletedSuccess) {
                const deleteResult = await ctx.db
                    .delete(runs)
                    .where(and(eq(runs.id, input.runId), eq(runs.userId, userId)));
                if (deleteResult.rowsAffected === 0) {
                    throw new TRPCError({ code: 'NOT_FOUND', message: 'Run not found while deletion' });
                }
            } else {
                throw new Error('Not all files could be deleted');
            }
        } catch (e) {
            console.error(
                `Error while deleting run, after marking deleted. For user ${userId} and run ${input.runId}`,
                e,
            );
            await sendMailToSupport({
                subject: 'Run deletion failed',
                text: `Run deletion failed for user ${userId} and run ${input.runId}.`,
                html: `Please retry deletion manually`,
            });
        }
    });

export const setRunArchivedProcedure = protectedProcedure
    .input(z.object({ runId: z.string(), archived: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;

        const result = await ctx.db
            .update(runs)
            .set({ archived: input.archived })
            .where(and(eq(runs.id, input.runId), eq(runs.userId, userId)));

        if (result.rowsAffected === 0) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Run not found while setting archived' });
        }
    });
