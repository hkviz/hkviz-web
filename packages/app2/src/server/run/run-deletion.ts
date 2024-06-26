import { TRPCError } from '@trpc/server';
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { sendMailToSupport } from '~/lib/mails';
import { r2DeleteFile, r2RunPartFileKey } from '~/lib/r2';
import { runFiles, runLocalIds, runs } from '~/server/db/schema';
import { protectedProcedure } from '../../trpc';
import { db } from '~/server/db';

export async function deleteRun({ runId, userId }: { runId: string; userId: string }) {
    // first set deleted flag for run, so even if it fails, the run can be deleted later
    const result = await db
        .update(runs)
        .set({ deleted: true })
        .where(and(eq(runs.id, runId), eq(runs.userId, userId), eq(runs.preventDeletion, false)));

    if (result.rowsAffected === 0) {
        console.error(`Error while deleting run, not found. For user ${userId} and run ${runId}`);
        await sendMailToSupport({
            subject: 'Run deletion failed. Not found.',
            text: `Run deletion failed for user ${userId} and run ${runId}.`,
            html: `Run deletion failed for user ${userId} and run ${runId}.`,
        });
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Run not found while setting deleted' });
    }

    // localIds are removed immediately, so they can be used for further uploads
    // uploads with the same local id will create a new run
    await db.delete(runLocalIds).where(eq(runLocalIds.runId, runId));

    try {
        const files = await db.query.runFiles.findMany({
            where: (runFiles, { and, eq }) => and(eq(runFiles.runId, runId)),
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
        await db.delete(runFiles).where(
            and(
                eq(runFiles.runId, runId),
                inArray(
                    runFiles.id,
                    successfullyDeleted.map((it) => it.id),
                ),
            ),
        );

        // if not all files were deleted, the run is not deleted
        if (allFilesDeletedSuccess) {
            const deleteResult = await db.delete(runs).where(and(eq(runs.id, runId), eq(runs.userId, userId)));
            if (deleteResult.rowsAffected === 0) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Run not found while deletion' });
            }
        } else {
            throw new Error('Not all files could be deleted');
        }
    } catch (e) {
        console.error(`Error while deleting run, after marking deleted. For user ${userId} and run ${runId}`, e);
        await sendMailToSupport({
            subject: 'Run deletion failed',
            text: `Run deletion failed for user ${userId} and run ${runId}.`,
            html: `Run deletion failed for user ${userId} and run ${runId}.`,
        });
    }
}

export const deleteRunProcedure = protectedProcedure
    .input(z.object({ runId: z.string() }))
    .mutation(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;
        await deleteRun({ runId: input.runId, userId });
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
