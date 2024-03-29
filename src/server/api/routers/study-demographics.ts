import { z } from 'zod';
import { studyDemographicSchema } from '~/lib/types/study-demographic-data';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { userDemographics } from '~/server/db/schema';

export const studyDemographicsRouter = createTRPCRouter({
    save: protectedProcedure.input(studyDemographicSchema).mutation(async ({ ctx, input }) => {
        const result = await ctx.db.insert(userDemographics).values({
            userId: ctx.session.user.id,
            ...input,
        });
        if (result.rowsAffected !== 1) {
            throw new Error('Could not save demographics');
        }

        // .onDuplicateKeyUpdate({
        //     set: {
        //         keepDataAfterStudyConducted: input.keepDataAfterStudyConducted,
        //         futureContactOk: input.futureContactOk,
        //     },
        // });
    }),

    getOwn: protectedProcedure.input(z.object({})).query(async ({ ctx }) => {
        return await ctx.db.query.userDemographics.findFirst({
            where: (userDemographics, { eq }) => eq(userDemographics.userId, ctx.session.user.id),
        });
    }),
});
