import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { r2FileHead, r2GetSignedUploadUrl, r2RunPartFileKey } from '~/lib/r2';

import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { tagSchema } from '~/lib/types/tags';
import { raise } from '~/lib/utils/utils';
import { mapZoneSchema } from '~/lib/viz/types/mapZone';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';
import { runFiles, runs, type RunGameStateMetaColumnName } from '~/server/db/schema';
import { getUserIdFromIngameSession } from '../ingameauth';
import { assertIsResearcher } from '../lib/researcher';
import { getOrCreateRunId } from './get-or-create-run-id';
import { runGameStateMetaColumnsSelect } from './run-column-selects';
import { deleteRunProcedure, setRunArchivedProcedure } from './run-deletion';
import { findRuns } from './runs-find';

export const runRouter = createTRPCRouter({
    getMetadataById: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
        const sessionUserId = ctx.session?.user?.id;

        const metadata =
            (
                await findRuns({
                    db: ctx.db,
                    filter: { id: [input.id] },
                    includeFiles: true,
                    skipVisibilityCheck: true,
                    currentUser: sessionUserId ? { id: sessionUserId } : undefined,
                })
            )[0] ??
            raise(
                new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Run not found',
                }),
            );

        if (metadata.visibility === 'private' && metadata.user.id !== ctx.session?.user?.id) {
            await assertIsResearcher({
                db: ctx.db,
                userId: ctx.session?.user?.id ?? raise(new Error('Not logged in')),
                makeError: () =>
                    new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'Run is private',
                    }),
            });
        }

        return {
            ...metadata,
            files: metadata.files!,
        };
    }),
    delete: deleteRunProcedure,
    setArchived: setRunArchivedProcedure,
    setVisibility: protectedProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                visibility: z.enum(['public', 'unlisted', 'private']),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user?.id ?? raise(new Error('Not logged in'));
            const result = await ctx.db
                .update(runs)
                .set({ visibility: input.visibility })
                .where(and(eq(runs.id, input.id), eq(runs.userId, userId)));

            if (result.rowsAffected !== 1) {
                throw new Error('Run not found');
            }
        }),
    setTag: protectedProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                code: tagSchema,
                hasTag: z.boolean(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user?.id ?? raise(new Error('Not logged in'));

            const result = await ctx.db
                .update(runs)
                .set({ [`tag_${input.code}`]: input.hasTag })
                .where(and(eq(runs.id, input.id), eq(runs.userId, userId)));

            if (result.rowsAffected !== 1) {
                throw new Error('Could not add tag');
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
                    and(eq(runFiles.runId, runId), eq(runFiles.partNumber, input.partNumber)),
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
                            lastCompletedRunFilePartNumber: true,
                            ...runGameStateMetaColumnsSelect,
                        },
                    })) ?? raise(new Error('Run not found'));

                if ((run.lastCompletedRunFilePartNumber ?? -1) < file.partNumber) {
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
    // TODO: remove
    // createUploadUrl: protectedProcedure
    //     .input(
    //         z.object({
    //             runFileId: z.string().uuid(),
    //             description: z.string().max(200),
    //             previousHollowKnightExperience: z.enum(['none', 'unfinished', 'finished', 'finishedMany']),
    //         }),
    //     )
    //     .mutation(async ({ ctx, input }) => {
    //         if (!ctx.session.user) {
    //             throw new Error('Not logged in');
    //         }
    //         const id = uuidv4();
    //         const bucketFileId = uuidv4();
    //         const userId = ctx.session.user.id;
    //         const { runFileId } = input;

    //         await ctx.db.insert(runs).values({
    //             id,
    //             bucketFileId,
    //             userId,
    //             runFileId,
    //         });

    //         // try {
    //         //     console.log(await r2.send(new ListBucketsCommand('')));
    //         // } catch (e) {
    //         //     console.error(e);
    //         // }

    //         const signedUrl = await getSignedUrl(
    //             r2,
    //             new PutObjectCommand({
    //                 Bucket: env.R2_BUCKET_NAME,
    //                 // ContentLength: 100 * 1024 * 1024,
    //                 Key: `hkrun_${bucketFileId}`,
    //             }),
    //             { expiresIn: 60 },
    //         );

    //         return { signedUrl, id };
    //     }),
});
