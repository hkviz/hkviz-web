import { z } from 'zod';
import { hkExperienceSchema } from '~/lib/types/hk-experience';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { hkExperience } from '~/server/db/schema';

export const hkExperienceRouter = createTRPCRouter({
    save: protectedProcedure.input(hkExperienceSchema).mutation(async ({ ctx, input }) => {
        await ctx.db.insert(hkExperience).values({
            userId: ctx.session.user.id,
            ...input,
        });
        // .onDuplicateKeyUpdate({
        //     set: {
        //         keepDataAfterStudyConducted: input.keepDataAfterStudyConducted,
        //         futureContactOk: input.futureContactOk,
        //     },
        // });
    }),

    getOwn: protectedProcedure.input(z.object({})).query(async ({ ctx }) => {
        return await ctx.db.query.hkExperience.findFirst({
            where: (hkExperience, { eq }) => eq(hkExperience.userId, ctx.session.user.id),
        });
    }),
});
