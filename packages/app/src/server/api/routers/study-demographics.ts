import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getParticipantIdFromCookieOrSessionUser } from '~/app/user-study/_utils';
import { studyDemographicSchema } from '~/lib/types/study-demographic-data';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';
import { userDemographics } from '~/server/db/schema';

export const studyDemographicsRouter = createTRPCRouter({
    save: publicProcedure.input(studyDemographicSchema).mutation(async ({ ctx, input }) => {
        const userId = ctx.session?.user?.id;
        const participantId = await getParticipantIdFromCookieOrSessionUser();
        if (!userId && !participantId) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Unauthorized',
            });
        }

        const existing = await ctx.db.query.userDemographics.findFirst({
            where: (userDemographics, { eq }) =>
                participantId
                    ? eq(userDemographics.participantId, participantId)
                    : eq(userDemographics.userId, userId!),
            columns: {
                id: true,
                userId: true,
                participantId: true,
            },
        });

        const values = {
            ...input,
            userId: userId ?? existing?.userId,
            participantId: participantId ?? existing?.participantId,
        };

        const result = existing
            ? await ctx.db.update(userDemographics).set(values).where(eq(userDemographics.id, existing.id))
            : await ctx.db.insert(userDemographics).values(values);

        if (result.rowsAffected !== 1) {
            throw new Error('Could not save demographics');
        }
    }),

    getFromLoggedInUser: protectedProcedure.input(z.object({})).query(async ({ ctx }) => {
        return await ctx.db.query.userDemographics.findFirst({
            where: (userDemographics, { eq }) => eq(userDemographics.userId, ctx.session.user.id),
        });
    }),

    getFromParticipantId: publicProcedure
        .input(z.object({ participantId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.query.userDemographics.findFirst({
                where: (userDemographics, { eq }) => eq(userDemographics.participantId, input.participantId),
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

        return await ctx.db.query.userDemographics.findFirst({
            where: (userDemographics, { eq }) =>
                participantId
                    ? eq(userDemographics.participantId, participantId)
                    : eq(userDemographics.userId, userId!),
        });
    }),
});
