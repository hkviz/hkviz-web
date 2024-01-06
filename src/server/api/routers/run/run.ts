import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { r2FileHead, r2GetSignedDownloadUrl, r2GetSignedUploadUrl, r2RunPartFileKey } from '~/lib/r2';

import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { tagSchema, type TagCode } from '~/lib/types/tags';
import { raise } from '~/lib/utils';
import { mapZoneSchema } from '~/lib/viz/types/mapZone';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';
import { type DB } from '~/server/db';
import { runFiles, runs } from '~/server/db/schema';
import { getUserIdFromIngameSession } from '../ingameauth';
import { assertIsResearcher } from '../lib/researcher';
import { runTagFieldsSelect } from './run-column-selects';
import { findRuns, runFilterSchema } from './runs-find';

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
    getMetadataById: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
        const metadata =
            (await ctx.db.query.runs.findFirst({
                where: (run, { eq, and }) => and(eq(run.id, input.id)),
                columns: {
                    id: true,
                    description: true,
                    visibility: true,
                    ...runTagFieldsSelect,
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

        let isResearchView = false;
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
            isResearchView = true;
        }

        return {
            id: metadata.id,
            description: metadata.description,
            visibility: metadata.visibility,
            tags: Object.entries(metadata)
                .filter((kv) => kv[0].startsWith('tag_') && kv[1] === true)
                .map((kv) => kv[0].slice(4)) as TagCode[],
            user: {
                id: isResearchView ? '' : metadata.user.id,
                name: isResearchView ? 'Anonym' : metadata.user.name ?? 'Unnamed user',
            },
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
    setRunVisibility: protectedProcedure
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
    findRuns: publicProcedure.input(runFilterSchema).query(async ({ ctx, input }) => {
        const sessionUserId = ctx.session?.user?.id;

        return findRuns({
            db: ctx.db,
            currentUser: sessionUserId
                ? {
                      id: sessionUserId,
                  }
                : undefined,
            filter: input,
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
