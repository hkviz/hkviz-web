import { TRPCError } from '@trpc/server';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { getParticipantIdFromCookie } from '~/app/user-study/_utils';
import { db } from '~/server/db';
import { hkExperience, studyParticipant, userDemographics, userStudyInformedConsent, users } from '~/server/db/schema';
import { createTRPCRouter, publicProcedure } from '../../trpc';

async function exists({ participantId }: { participantId: string }) {
    const participant = await db.query.studyParticipant.findFirst({
        where: (participant, { eq }) => eq(participant.participantId, participantId),
        columns: {
            participantId: true,
        },
    });

    return !!participant;
}

async function existsAndStoreUserId({ participantId, userId }: { participantId: string; userId: string | null }) {
    if (!(await exists({ participantId }))) return false;

    if (userId) {
        await db
            .update(users)
            .set({ participantId: participantId })
            .where(and(eq(users.id, userId), isNull(users.participantId)));
        await db.update(userDemographics).set({ participantId }).where(eq(userDemographics.userId, userId));
        await db.update(hkExperience).set({ participantId }).where(eq(hkExperience.userId, userId));
    }
    return true;
}

export const participantRouter = createTRPCRouter({
    exists: publicProcedure.input(z.object({ participantId: z.string().uuid() })).query(async ({ input }) => {
        return await exists(input);
    }),
    getByParticipantId: publicProcedure
        .input(z.object({ participantId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const result = await ctx.db.query.studyParticipant.findFirst({
                where: (studyParticipant, { eq }) => eq(studyParticipant.participantId, input.participantId),
                columns: {
                    skipLoginQuestion: true,
                },
                with: {
                    user: {
                        columns: {
                            id: true,
                        },
                    },
                },
            });
            if (!result) return null;
            return {
                hasUserId: !!result.user?.id,
                skipLoginQuestion: result.skipLoginQuestion,
            };
        }),
    existsAndStoreUserId: publicProcedure
        .input(z.object({ participantId: z.string().uuid(), userId: z.string().nullable() }))
        .mutation(async ({ input }) => {
            return await existsAndStoreUserId(input);
        }),
    setSkipLoginQuestion: publicProcedure.mutation(async ({ ctx }) => {
        const participantId = getParticipantIdFromCookie();
        if (!participantId) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'No participant ID found',
            });
        }
        const result = await ctx.db
            .update(studyParticipant)
            .set({ skipLoginQuestion: true })
            .where(eq(studyParticipant.participantId, participantId));
        if (result.rowsAffected !== 1) {
            throw new Error('Could not set skipLoginQuestion');
        }
    }),

    resetParticipant: publicProcedure
        .input(z.object({ resetId: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            if (!input.resetId) {
                // im paranoid :) - this should never happen
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Invalid reset ID',
                });
            }

            const participant = await ctx.db.query.studyParticipant.findFirst({
                where: (studyParticipant, { eq }) => eq(studyParticipant.resetId, input.resetId),
            });

            if (!participant) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Participant not found',
                });
            }
            const participantId = participant.participantId;

            await ctx.db.delete(hkExperience).where(eq(hkExperience.participantId, participantId));
            await ctx.db.delete(userDemographics).where(eq(userDemographics.participantId, participantId));
            await ctx.db
                .delete(userStudyInformedConsent)
                .where(eq(userStudyInformedConsent.participantId, participantId));
        }),
});
