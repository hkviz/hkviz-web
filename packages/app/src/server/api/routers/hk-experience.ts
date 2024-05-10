import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getParticipantIdFromCookieOrSessionUser } from '~/app/user-study/_utils';
import { hkExperienceFinished, hkExperienceSchema } from '~/lib/types/hk-experience';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';
import { hkExperience } from '~/server/db/schema';

export const hkExperienceRouter = createTRPCRouter({
    save: publicProcedure.input(hkExperienceSchema).mutation(async ({ ctx, input }) => {
        if (!hkExperienceFinished(input)) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Experience form not finished',
            });
        }

        const userId = ctx.session?.user?.id;
        const participantId = await getParticipantIdFromCookieOrSessionUser();

        if (!userId && !participantId) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Unauthorized',
            });
        }

        const existing = await ctx.db.query.hkExperience.findFirst({
            where: (hkExperience, { eq }) =>
                participantId ? eq(hkExperience.participantId, participantId) : eq(hkExperience.userId, userId!),
            columns: {
                id: true,
                userId: true,
                participantId: true,
            },
        });

        const values = {
            ...input,
            playedBefore: input.playingSince !== 'never',
            userId: userId ?? existing?.userId,
            participantId: participantId ?? existing?.participantId,
        };

        const result = existing
            ? await ctx.db.update(hkExperience).set(values).where(eq(hkExperience.id, existing.id))
            : await ctx.db.insert(hkExperience).values(values);

        if (result.rowsAffected !== 1) {
            throw new Error('Could not save hk experience');
        }

        revalidatePath('/user-study/participate/' + participantId);
    }),

    getFromLoggedInUser: protectedProcedure.input(z.object({})).query(async ({ ctx }) => {
        return await ctx.db.query.hkExperience.findFirst({
            where: (hkExperience, { eq }) => eq(hkExperience.userId, ctx.session.user.id),
        });
    }),

    getFromParticipantId: publicProcedure
        .input(z.object({ participantId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.query.hkExperience.findFirst({
                where: (hkExperience, { eq }) => eq(hkExperience.participantId, input.participantId),
            });
        }),

    getFromLoggedInUserOrParticipantId: publicProcedure.query(async ({ ctx }) => {
        const userId = ctx.session?.user?.id;
        const participantId = await getParticipantIdFromCookieOrSessionUser();
        if (!userId && !participantId) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Unauthorized',
            });
        }

        return await ctx.db.query.hkExperience.findFirst({
            columns: {
                playingSince: true,
                playingFrequency: true,
                gotDreamnail: true,
                didEndboss: true,
                enteredWhitePalace: true,
                got112Percent: true,
            },
            where: (hkExperience, { eq }) =>
                participantId ? eq(hkExperience.participantId, participantId) : eq(hkExperience.userId, userId!),
        });
    }),
});
