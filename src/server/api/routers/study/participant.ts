import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '~/server/db';
import { hkExperience, userDemographics, users } from '~/server/db/schema';
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
    existsAndStoreUserId: publicProcedure
        .input(z.object({ participantId: z.string().uuid(), userId: z.string().nullable() }))
        .mutation(async ({ input }) => {
            return await existsAndStoreUserId(input);
        }),
});
