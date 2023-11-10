import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { env } from '~/env.mjs';
import { r2 } from '~/lib/r2';

import { raise } from '~/lib/utils';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { hkRuns } from '~/server/db/schema';

export const runRouter = createTRPCRouter({
    getMetadataById: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
        const metadata =
            (await ctx.db.query.hkRuns.findFirst({
                where: (hkRuns, { eq }) => eq(hkRuns.id, input.id),
                columns: {
                    id: true,
                    bucketFileId: true,
                    description: true,
                },
                with: {
                    user: {
                        columns: {
                            id: true,
                            name: true,
                        },
                    },
                },
            })) ?? raise(new Error('Not found'));

        const signedDownloadFileUrl = await getSignedUrl(
            r2,
            new GetObjectCommand({
                Bucket: env.R2_BUCKET_NAME,
                // ContentLength: 100 * 1024 * 1024,
                Key: `hkrun_${metadata.bucketFileId}`,
            }),
            { expiresIn: 60 },
        );

        return { ...metadata, signedDownloadFileUrl };
    }),
    createUploadUrl: protectedProcedure
        .input(
            z.object({
                runFileId: z.string().uuid(),
                description: z.string().max(200),
                previousHollowKnightExperience: z.enum(['none', 'unfinished', 'finished', 'finishedMany']),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            if (!ctx.session.user) {
                throw new Error('Not logged in');
            }
            const id = uuidv4();
            const bucketFileId = uuidv4();
            const userId = ctx.session.user.id;
            const { runFileId } = input;

            await ctx.db.insert(hkRuns).values({
                id,
                bucketFileId,
                userId,
                runFileId,
            });

            // try {
            //     console.log(await r2.send(new ListBucketsCommand('')));
            // } catch (e) {
            //     console.error(e);
            // }

            const signedUrl = await getSignedUrl(
                r2,
                new PutObjectCommand({
                    Bucket: env.R2_BUCKET_NAME,
                    // ContentLength: 100 * 1024 * 1024,
                    Key: `hkrun_${bucketFileId}`,
                }),
                { expiresIn: 60 },
            );

            return { signedUrl, id };
        }),
});
