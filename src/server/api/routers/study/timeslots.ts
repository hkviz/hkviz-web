import { and, eq, isNull } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { studyParticipant, userStudyTimeSlot, users } from '~/server/db/schema';
import { createTRPCRouter, publicProcedure } from '../../trpc';

export const userStudyTimeSlotRouter = createTRPCRouter({
    findAllVisible: publicProcedure.query(async ({ ctx }) => {
        const result = await ctx.db.query.userStudyTimeSlot.findMany({
            orderBy: (timeSlot) => timeSlot.startAt,
        });

        return result
            .map((timeSlot) => {
                return {
                    id: timeSlot.id,
                    startAt: timeSlot.startAt,
                    free: timeSlot.participantId === null,
                };
            })
            .filter((it) => it.free);
    }),
    book: publicProcedure
        .input(
            z.discriminatedUnion('callOption', [
                z.object({
                    id: z.number(),
                    callOption: z.literal('zoom'),
                    callName: z.string().email(),
                }),
                z.object({
                    id: z.number(),
                    callOption: z.literal('discord'),
                    callName: z.string().max(32),
                }),
            ]),
        )
        .mutation(async ({ ctx, input }) => {
            const { id, callOption, callName } = input;

            const participantId = uuid();

            const updateResult = await ctx.db
                .update(userStudyTimeSlot)
                .set({
                    participantId: participantId,
                })
                .where(and(eq(userStudyTimeSlot.id, id), isNull(userStudyTimeSlot.participantId)));

            if (updateResult.rowsAffected === 0) {
                return false;
            }

            const insertResult = await ctx.db.insert(studyParticipant).values({
                participantId,
                callOption,
                callName,
            });

            if (insertResult.rowsAffected === 0) {
                throw new Error('Failed to insert study participant');
            }

            const userId = ctx.session?.user?.id;

            if (userId != null) {
                await ctx.db
                    .update(users)
                    .set({ participantId })
                    .where(and(eq(users.id, userId), isNull(users.participantId)));
            }

            return participantId;
        }),
});
