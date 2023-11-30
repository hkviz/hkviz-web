import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { r2FileExists, r2GetSignedDownloadUrl, r2GetSignedUploadUrl, r2RunPartFileKey } from '~/lib/r2';

import { and, eq } from 'drizzle-orm';
import { raise } from '~/lib/utils';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { type DB } from '~/server/db';
import { runFiles, runs } from '~/server/db/schema';
import { getUserIdFromIngameSession } from './ingameauth';

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
                metadata.files
                    .filter((it) => it.uploadFinished)
                    .sort((a, b) => a.partNumber - b.partNumber)
                    .map(async (file) => ({
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

            if (!(await r2FileExists(r2RunPartFileKey(input.fileId)))) {
                throw new Error('File not found in r2 bucket. Not marked as finished');
            }

            const result = await ctx.db
                .update(runFiles)
                .set({ uploadFinished: true, version: 1 })
                .where(and(eq(runFiles.id, input.fileId), eq(runFiles.runId, runId)));

            if (result.rowsAffected !== 1) {
                throw new Error('File not found');
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
