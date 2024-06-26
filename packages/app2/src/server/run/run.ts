import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { r2FileHead, r2GetSignedUploadUrl, r2RunPartFileKey } from '~/lib/r2';

import { mapZoneSchema, raise } from '@hkviz/parser';
import { and, eq } from 'drizzle-orm';
import { MAX_RUN_TITLE_LENGTH } from '~/lib/types/run-fields';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';
import { runFiles, runs, type RunGameStateMetaColumnName } from '~/server/db/schema';
import { getUserIdFromIngameSession } from '../ingameauth';
import { getOrCreateRunId } from './get-or-create-run-id';
import { runGameStateMetaColumnsSelect } from './run-column-selects';
import { combineRunsProcedure, uncombineRunProcedure } from './run-combine';
import { deleteRunProcedure, setRunArchivedProcedure } from './run-deletion';

export const runRouter = createTRPCRouter({
    delete: deleteRunProcedure,
    setArchived: setRunArchivedProcedure,
    setTitle: protectedProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                title: z.string().max(MAX_RUN_TITLE_LENGTH),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user?.id ?? raise(new Error('Not logged in'));

            const result = await ctx.db
                .update(runs)
                .set({ title: input.title })
                .where(and(eq(runs.id, input.id), eq(runs.userId, userId)));

            if (result.rowsAffected !== 1) {
                throw new Error('Could not update title');
            }
        }),
    createUploadPartUrl: publicProcedure
        .input(
            z.object({
                ingameAuthId: z.string().uuid(),
                localRunId: z.string().uuid(),
                partNumber: z.number().int().min(1),

                hkVersion: z.string().max(64).nullable().optional(),
                playTime: z.number().nullable().optional(),
                maxHealth: z.number().int().nullable().optional(),
                mpReserveMax: z.number().int().nullable().optional(),
                geo: z.number().int().nullable().optional(),
                dreamOrbs: z.number().int().nullable().optional(),
                permadeathMode: z.number().int().nullable().optional(),
                mapZone: mapZoneSchema.nullable().optional(),
                killedHollowKnight: z.boolean().nullable().optional(),
                killedFinalBoss: z.boolean().nullable().optional(),
                killedVoidIdol: z.boolean().nullable().optional(),
                completionPercentage: z.number().int().nullable().optional(),
                unlockedCompletionRate: z.boolean().nullable().optional(),
                dreamNailUpgraded: z.boolean().nullable().optional(),
                lastScene: z.string().max(255).nullable().optional(),

                firstUnixSeconds: z.number().nullable().optional(),
                lastUnixSeconds: z.number().nullable().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const userId = await getUserIdFromIngameSession(ctx.db, input.ingameAuthId);
            const runId = await getOrCreateRunId(ctx.db, input.localRunId, userId);

            // if there is already a row for that part we can use it
            const existingFile = await ctx.db.query.runFiles.findFirst({
                where: (runFiles, { and, eq }) =>
                    and(
                        eq(runFiles.runId, runId),
                        eq(runFiles.partNumber, input.partNumber),
                        eq(runFiles.localId, input.localRunId),
                    ),
                columns: {
                    id: true,
                    uploadFinished: true,
                },
            });

            if (existingFile?.uploadFinished) {
                // unless already uploaded
                throw new Error('File already uploaded');
            } else if (existingFile) {
                return {
                    fileId: existingFile.id,
                    runId,
                    signedUploadUrl: await r2GetSignedUploadUrl(r2RunPartFileKey(existingFile.id)),
                };
            }

            const fileId = uuidv4();

            await ctx.db.insert(runFiles).values({
                id: fileId,
                runId,
                localId: input.localRunId,
                partNumber: input.partNumber,
                uploadFinished: false,
                version: 0,

                hkVersion: input.hkVersion,
                playTime: input.playTime,
                maxHealth: input.maxHealth,
                mpReserveMax: input.mpReserveMax,
                geo: input.geo,
                dreamOrbs: input.dreamOrbs,
                permadeathMode: input.permadeathMode,
                mapZone: input.mapZone,

                killedHollowKnight: input.killedHollowKnight,
                killedFinalBoss: input.killedFinalBoss,
                killedVoidIdol: input.killedVoidIdol,
                completionPercentage: input.completionPercentage,
                unlockedCompletionRate: input.unlockedCompletionRate,
                dreamNailUpgraded: input.dreamNailUpgraded,
                lastScene: input.lastScene,

                startedAt: input.firstUnixSeconds ? new Date(input.firstUnixSeconds * 1000) : null,
                endedAt: input.lastUnixSeconds ? new Date(input.lastUnixSeconds * 1000) : null,
            });
            return { fileId, runId, signedUploadUrl: await r2GetSignedUploadUrl(r2RunPartFileKey(fileId)) };
        }),
    markUploadPartFinished: publicProcedure
        .input(
            z.object({
                ingameAuthId: z.string().uuid(),
                localRunId: z.string().uuid(),
                fileId: z.string().uuid(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const userId = await getUserIdFromIngameSession(ctx.db, input.ingameAuthId);
            const runId = await getOrCreateRunId(ctx.db, input.localRunId, userId);

            // first get to make sure file belongs to user and is not already marked as finished
            const file =
                (await ctx.db.query.runFiles.findFirst({
                    where: (runFiles, { and, eq }) =>
                        and(
                            eq(runFiles.id, input.fileId),
                            eq(runFiles.runId, runId),
                            eq(runFiles.uploadFinished, false),
                        ),
                    columns: {
                        id: true,
                        partNumber: true,
                        ...runGameStateMetaColumnsSelect,
                    },
                })) ?? raise(new Error('File not found or already marked as finished'));

            const head = await r2FileHead(r2RunPartFileKey(input.fileId));
            if (!head) {
                throw new Error('File not found in r2 bucket. Not marked as finished');
            }

            const result = await ctx.db
                .update(runFiles)
                .set({ uploadFinished: true, version: 1, contentLength: head.ContentLength })
                .where(and(eq(runFiles.id, input.fileId), eq(runFiles.runId, runId)));

            if (result.rowsAffected !== 1) {
                throw new Error('File not found');
            }

            try {
                const run =
                    (await ctx.db.query.runs.findFirst({
                        where: (run, { eq }) => eq(run.id, runId),
                        columns: {
                            id: true,
                            ...runGameStateMetaColumnsSelect,
                        },
                    })) ?? raise(new Error('Run not found'));

                if ((run.playTime ?? -1) < (file.playTime ?? 0)) {
                    await ctx.db
                        .update(runs)
                        .set({
                            hkVersion: file.hkVersion ?? run.hkVersion,
                            playTime: file.playTime ?? run.playTime,
                            maxHealth: file.maxHealth ?? run.maxHealth,
                            mpReserveMax: file.mpReserveMax ?? run.mpReserveMax,
                            geo: file.geo ?? run.geo,
                            dreamOrbs: file.dreamOrbs ?? run.dreamOrbs,
                            permadeathMode: file.permadeathMode ?? run.permadeathMode,
                            mapZone: file.mapZone ?? run.mapZone,
                            killedHollowKnight: file.killedHollowKnight ?? run.killedHollowKnight,
                            killedFinalBoss: file.killedFinalBoss ?? run.killedFinalBoss,
                            killedVoidIdol: file.killedVoidIdol ?? run.killedVoidIdol,
                            completionPercentage: file.completionPercentage ?? run.completionPercentage,
                            unlockedCompletionRate: file.unlockedCompletionRate ?? run.unlockedCompletionRate,
                            dreamNailUpgraded: file.dreamNailUpgraded ?? run.dreamNailUpgraded,
                            lastScene: file.lastScene ?? run.lastScene,

                            startedAt: run.startedAt ?? file.startedAt,
                            endedAt: file.endedAt ?? run.endedAt,
                        } satisfies { [Col in RunGameStateMetaColumnName]: unknown })
                        .where(eq(runs.id, runId));
                }
            } catch (ex) {
                console.error('Could not update run meta from file', ex);
            }
        }),
    combine: combineRunsProcedure,
    uncombine: uncombineRunProcedure,
});
