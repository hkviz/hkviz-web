import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { dataCollectionStudyParticipations } from '~/server/db/schema';

export const studyParticipationRouter = createTRPCRouter({
    saveStudyParticipation: protectedProcedure
        .input(
            z.object({
                keepDataAfterStudyConducted: z.boolean(),
                futureContactOk: z.boolean(),
                excludedSinceU18: z.boolean(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .insert(dataCollectionStudyParticipations)
                .values({
                    userId: ctx.session.user.id,
                    keepDataAfterStudyConducted: input.keepDataAfterStudyConducted,
                    futureContactOk: input.futureContactOk,
                    excludedSinceU18: input.excludedSinceU18,
                })
                .onConflictDoUpdate({
                    target: dataCollectionStudyParticipations.userId,
                    set: {
                        keepDataAfterStudyConducted: input.keepDataAfterStudyConducted,
                        futureContactOk: input.futureContactOk,
                        excludedSinceU18: input.excludedSinceU18,
                    },
                });
        }),
    getStudyParticipation: protectedProcedure.input(z.object({})).query(async ({ ctx }) => {
        return await ctx.db.query.dataCollectionStudyParticipations.findFirst({
            where: (dataCollectionStudyParticipations, { eq }) =>
                eq(dataCollectionStudyParticipations.userId, ctx.session.user.id),
        });
    }),
});
