import { ListBucketsCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';
import { env } from '~/env.mjs';
import { r2 } from '~/lib/r2';
import { v4 as uuidv4 } from 'uuid';

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { hkRuns } from '~/server/db/schema';

export const uploadRouter = createTRPCRouter({
    createUploadUrl: protectedProcedure
        .input(
            z.object({
                runId: z.string().uuid(),
                description: z.string().max(200),
                previousHollowKnightExperience: z.enum(['none', 'unfinished', 'finished', 'finishedMany']),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            if (!ctx.session.user) {
                throw new Error('Not logged in');
            }
            const id = uuidv4();
            const fileId = uuidv4();
            const userId = ctx.session.user.id;
            const { runId } = input;

            await ctx.db.insert(hkRuns).values({
                id,
                fileId,
                userId,
                runId,
            });

            try {
                console.log(await r2.send(new ListBucketsCommand('')));
            } catch (e) {
                console.error(e);
            }

            const signedUrl = await getSignedUrl(
                r2,
                new PutObjectCommand({
                    Bucket: env.R2_BUCKET_NAME,
                    // ContentLength: 100 * 1024 * 1024,
                    Key: `hkrun_${fileId}`,
                }),
                { expiresIn: 60 },
            );

            return { signedUrl };
        }),
});
