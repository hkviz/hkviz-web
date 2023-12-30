import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { r2FileHead, r2GetSignedDownloadUrl, r2GetSignedUploadUrl, r2RunPartFileKey } from '~/lib/r2';

import { and, eq } from 'drizzle-orm';
import { raise } from '~/lib/utils';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { type DB } from '~/server/db';
import { runFiles, runs } from '~/server/db/schema';
import { getUserIdFromIngameSession } from './ingameauth';
import { mapZoneSchema } from '~/lib/viz/types/mapZone';

const runFilesMetaFields = {
    hkVersion: true,
    playTime: true,
    maxHealth: true,
    mpReserveMax: true,
    geo: true,
    dreamOrbs: true,
    permadeathMode: true,
    mapZone: true,
    killedHollowKnight: true,
    killedFinalBoss: true,
    killedVoidIdol: true,
    completionPercentage: true,
    unlockedCompletionRate: true,
    dreamNailUpgraded: true,
    lastScene: true,
} as const;

async function getOrCreateRunId(db: DB, localId: string, userId: string): Promise<string> {
    const existingRunId = (
        await db.query.runs.findFirst({
            where: (run, { and, eq }) => and(eq(run.localId, localId), eq(run.userId, userId)),
            columns: {
                id: true,
            },
        })
    )?.id;

    if (existingRunId) {
        return existingRunId;
    }

    const newId = uuidv4();
    await db.insert(runs).values({
        id: newId,
        localId,
        userId,
    });

    return newId;
}

export const runRouter = createTRPCRouter({
    getMetadataById: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
        const metadata =
            (await ctx.db.query.runs.findFirst({
                where: (run, { eq, and }) => and(eq(run.id, input.id)),
                columns: {
                    id: true,
                    description: true,
                },
                with: {
                    user: {
                        columns: {
                            id: true,
                            name: true,
                        },
                    },
                    files: {
                        columns: {
                            id: true,
                            partNumber: true,
                            uploadFinished: true,
                            version: true,
                            createdAt: true,
                        },
                        orderBy: (files, { asc }) => [asc(files.partNumber)],
                        where: (files, { eq }) => eq(files.uploadFinished, true),
                    },
                },
            })) ??
            raise(
                new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Run not found',
                }),
            );

        return {
            ...metadata,
            // TODO use metadata from recording file
            startedAt: metadata.files[0]?.createdAt,
            lastPlayedAt: metadata.files[metadata.files.length - 1]?.createdAt,
            files: await Promise.all(
                metadata.files.map(async (file) => ({
                    ...file,
                    signedUrl: await r2GetSignedDownloadUrl(r2RunPartFileKey(file.id)),
                })),
            ),
        };
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
                permadeathMode: z.boolean().nullable().optional(),
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
            (await ctx.db.query.runFiles.findFirst({
                where: (runFiles, { and, eq }) =>
                    and(eq(runFiles.id, input.fileId), eq(runFiles.runId, runId), eq(runFiles.uploadFinished, false)),
                columns: {
                    id: true,
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
        }),
    getUsersRuns: publicProcedure.input(z.object({ userId: z.string().uuid() })).query(async ({ ctx, input }) => {
        const runs = await ctx.db.query.runs.findMany({
            where: (run, { eq }) => eq(run.userId, input.userId),
            columns: {
                id: true,
                description: true,
                createdAt: true,
            },
            with: {
                user: {
                    columns: {
                        id: true,
                        name: true,
                    },
                },
                files: {
                    columns: {
                        createdAt: true,
                        startedAt: true,
                        endedAt: true,
                        ...runFilesMetaFields,
                    },
                    orderBy: (files, { asc }) => [asc(files.partNumber)],
                    where: (files, { eq }) => eq(files.uploadFinished, true),
                },
            },
        });

        return runs
            .map(({ files, ...run }) => {
                const firstFile = files[0];
                const lastFile = files.at(-1);
                const isBrokenSteelSoul = lastFile?.lastScene === 'PermaDeath';
                const isSteelSoul = (firstFile?.permadeathMode ?? false) || isBrokenSteelSoul;

                const lastNonBrokenFile = isBrokenSteelSoul ? files.at(-2) ?? lastFile : lastFile;

                return {
                    ...run,
                    startedAt: firstFile?.startedAt ?? firstFile?.createdAt,
                    lastPlayedAt: lastFile?.endedAt ?? lastFile?.createdAt,
                    lastNonBrokenFile,
                    isSteelSoul,
                    isBrokenSteelSoul,
                };
            })
            .sort((a, b) => {
                if (a.lastPlayedAt && b.lastPlayedAt) {
                    return b.lastPlayedAt.getTime() - a.lastPlayedAt.getTime();
                } else if (a.lastPlayedAt) {
                    return -1;
                } else if (b.lastPlayedAt) {
                    return 1;
                } else {
                    return b.createdAt.getTime() - a.createdAt.getTime();
                }
            });
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
