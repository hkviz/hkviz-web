import { z } from 'zod';
import { db } from '~/server/db';
import { userStudyInformedConsent } from '~/server/db/schema';
import { createTRPCRouter, publicProcedure } from '../../trpc';

async function didAccept({ participantId }: { participantId: string }) {
    const consent = await db.query.userStudyInformedConsent.findFirst({
        where: (consent, { eq }) => eq(consent.participantId, participantId),
    });
    return !!consent;
}

async function accept({ participantId }: { participantId: string }) {
    await db.insert(userStudyInformedConsent).values({
        participantId,
    });
}

export const userStudyInformedConsentRouter = createTRPCRouter({
    didAccept: publicProcedure.input(z.object({ participantId: z.string().uuid() })).query(async ({ input }) => {
        return await didAccept(input);
    }),
    accept: publicProcedure.input(z.object({ participantId: z.string().uuid() })).mutation(async ({ input }) => {
        return await accept(input);
    }),
});
