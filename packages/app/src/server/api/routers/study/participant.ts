import { TRPCError } from '@trpc/server';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { getParticipantIdFromCookieOrSessionUser } from '~/app/user-study/_utils';
import { db } from '~/server/db';
import { hkExperience, studyParticipant, userDemographics, users } from '~/server/db/schema';
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

export async function getParticipantsForAdmin() {
    const result = await db.query.studyParticipant.findMany({
        columns: {
            participantId: true,
            callOption: true,
            callName: true,
            locale: true,
            timeZone: true,
            comment: true,
            userStudyFinished: true,
        },
        with: {
            informedConsent: {
                columns: {
                    createdAt: true,
                },
            },
            user: {
                columns: {
                    id: true,
                    email: true,
                    name: true,
                },
            },
            timeslot: {
                columns: {
                    id: true,
                    startAt: true,
                },
            },
            hkExperience: {
                columns: {
                    id: true,
                    playingSince: true,
                    playingFrequency: true,

                    playedBefore: true,
                    gotDreamnail: true,
                    didEndboss: true,
                    enteredWhitePalace: true,
                    got112Percent: true,
                },
            },
            demographics: {
                columns: {
                    id: true,
                    country: true,
                },
            },
        },
    });

    return result
        .sort((a, b) => {
            return (a.timeslot?.startAt?.getTime() ?? 0) - (b.timeslot?.startAt?.getTime() ?? 0);
        })
        .sort((a, b) => {
            return (a.userStudyFinished ? 1 : 0) - (b.userStudyFinished ? 1 : 0);
        })
        .map((p) => {
            return {
                ...p,
                timeslot: {
                    ...(p.timeslot ?? {}),
                    startAtVienna: p.timeslot?.startAt?.toLocaleString('de-AT', {
                        timeZone: 'Europe/Vienna',
                    }),
                    startAtParticipant: p.timeZone
                        ? p.timeslot?.startAt?.toLocaleString('de-AT', {
                              timeZone: p.timeZone,
                          })
                        : undefined,
                },
                informedConsent: {
                    ...(p.informedConsent ?? {}),
                    createdAt: p.informedConsent?.createdAt?.toLocaleString('de-AT', {
                        timeZone: 'Europe/Vienna',
                    }),
                },
            };
        });
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
                    locale: true,
                    timeZone: true,
                    callName: true,
                    callOption: true,
                    userStudyFinished: true,
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
                locale: result.locale,
                timeZone: result.timeZone,
                callName: result.callName,
                callOption: result.callOption,
                userStudyFinished: result.userStudyFinished,
            };
        }),
    existsAndStoreUserId: publicProcedure
        .input(z.object({ participantId: z.string().uuid(), userId: z.string().nullable() }))
        .mutation(async ({ input }) => {
            return await existsAndStoreUserId(input);
        }),
    setSkipLoginQuestion: publicProcedure.mutation(async ({ ctx }) => {
        const participantId = await getParticipantIdFromCookieOrSessionUser();
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
});
