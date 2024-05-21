import { and, eq, isNull, not, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { getParticipantIdFromCookieOrSessionUser } from '~/app/user-study/_utils';
import { formatTimeZoneName, getGmtOffset } from '~/app/user-study/participate/time-slot/_timezone-name';
import { sendMailToSupport, sendMailToUser } from '~/lib/mails';
import { studyParticipant, userStudyTimeSlot, users } from '~/server/db/schema';
import { createTRPCRouter, publicProcedure } from '../../trpc';

export const userStudyTimeSlotRouter = createTRPCRouter({
    findAllVisible: publicProcedure.query(async ({ ctx }) => {
        const participantId = await getParticipantIdFromCookieOrSessionUser();

        const until = new Date();
        until.setHours(until.getHours() + 2);

        const result = await ctx.db.query.userStudyTimeSlot.findMany({
            where: (timeSlot, { eq, gt, and, isNull, or }) => {
                const free = and(isNull(timeSlot.participantId), gt(timeSlot.startAt, until));
                if (participantId == null) {
                    return free;
                } else {
                    return or(free, eq(timeSlot.participantId, participantId));
                }
            },
            orderBy: (timeSlot) => timeSlot.startAt,
        });

        return result.map((timeSlot) => {
            return {
                id: timeSlot.id,
                startAt: timeSlot.startAt,
                free: timeSlot.participantId === null,
            };
        });
    }),
    findByParticipantId: publicProcedure
        .input(z.object({ participantId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const result = await ctx.db.query.userStudyTimeSlot.findFirst({
                where: (timeSlot, { eq }) => eq(timeSlot.participantId, input.participantId),
                columns: {
                    id: true,
                    startAt: true,
                },
            });

            if (!result) {
                return null;
            }

            return {
                id: result.id,
                startAt: result.startAt,
            };
        }),
    book: publicProcedure
        .input(
            z.discriminatedUnion('callOption', [
                z.object({
                    id: z.number(),
                    callOption: z.literal('zoom'),
                    callName: z.string().email(),
                    timeZone: z.string().min(3).max(100),
                    locale: z.string().min(2).max(10),
                }),
                z.object({
                    id: z.number(),
                    callOption: z.literal('discord'),
                    callName: z.string().max(32),
                    timeZone: z.string().min(3).max(100),
                    locale: z.string().min(2).max(10),
                }),
            ]),
        )
        .mutation(async ({ ctx, input }) => {
            revalidatePath('/user-study/participate/[id]', 'page');
            revalidatePath('/user-study/participate/time-slot', 'page');
            const { id, callOption, callName, locale, timeZone } = input;

            const participantCookie = await getParticipantIdFromCookieOrSessionUser();
            const participantExisted = participantCookie != null;

            if (participantCookie != null) {
                const existingParticipant = await ctx.db.query.studyParticipant.findFirst({
                    where: (participant) => eq(participant.participantId, participantCookie),
                });

                if (!existingParticipant) {
                    throw new Error('Participant id does not exist');
                }
            }

            const participantId = participantCookie ?? uuid();

            const updateResult = await ctx.db
                .update(userStudyTimeSlot)
                .set({
                    participantId,
                })
                .where(
                    and(
                        eq(userStudyTimeSlot.id, id),
                        or(isNull(userStudyTimeSlot.participantId), eq(userStudyTimeSlot.participantId, participantId)),
                    ),
                );

            if (updateResult.rowsAffected === 0) {
                return false;
            }

            const timeSlot = await ctx.db.query.userStudyTimeSlot.findFirst({
                where: (timeSlot, { eq }) => eq(timeSlot.id, id),
            });

            if (participantExisted) {
                await ctx.db
                    .update(userStudyTimeSlot)
                    .set({
                        participantId: null,
                    })
                    .where(and(eq(userStudyTimeSlot.participantId, participantId), not(eq(userStudyTimeSlot.id, id))));
            }

            const participantResult = participantExisted
                ? await ctx.db
                      .update(studyParticipant)
                      .set({
                          callOption,
                          callName,
                          locale,
                          timeZone,
                      })
                      .where(eq(studyParticipant.participantId, participantId))
                : await ctx.db.insert(studyParticipant).values({
                      participantId,
                      callOption,
                      callName,
                      locale,
                      timeZone,
                  });

            if (participantResult.rowsAffected === 0) {
                throw new Error('Failed to save study participant');
            }

            const userId = ctx.session?.user?.id;

            if (userId != null) {
                await ctx.db
                    .update(users)
                    .set({ participantId })
                    .where(and(eq(users.id, userId), isNull(users.participantId)));
            }

            void sendMailToSupport({
                subject: `User study time slot booked by ${participantId} for ${callOption} at timeslot ${id}. ${participantExisted ? 'Existing participant' : 'New participant'}`,
                text: `User study time slot booked by ${participantId} for ${callOption} at timeslot ${id}. ${participantExisted ? 'Existing participant' : 'New participant'}`,
            });

            if (callOption === 'zoom') {
                const startDate = timeSlot
                    ? Intl.DateTimeFormat(locale ?? 'en-US', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: timeZone ?? 'UTC',
                      }).format(new Date(timeSlot.startAt))
                    : null;
                const gmtOffset = getGmtOffset(timeZone ?? 'UTC');
                const timeZoneName = formatTimeZoneName(timeZone ?? 'UTC');
                void sendMailToUser({
                    subject: 'Your HKViz user study participation',
                    to: callName,
                    html: `
                        <div style="font-family: Arial, sans-serif;max-width: 60ch;margin: 0 auto;">
                            <p style="text-align:center;">
                                <img src="https://hkviz.org/favicons/apple-touch-icon-152x152.png" alt="HKViz logo" style="width: 100px; height: 100px;">
                            </p>

                            <p>
                                You have successfully booked a time slot for the HKViz user study at <br>
                                <b>${startDate}</b> <br>
                                ${timeZoneName} (${gmtOffset}). <br>
                                Thank you for participating!
                            </p>

                            <p>
                                You will receive a zoom link via email before our call starts.
                            </p>

                            <p>
                                To change your time slot, and for answering a few questions about yourself and your Hollow Knight experience, <br>
                                please visit the following link: <br> <a href="https://hkviz.org/user-study/participate/${participantId}">https://hkviz.com/user-study/participate/${participantId}</a><br>
                            </p>

                            <p>
                                You can also respond to this email if you have any questions or need to reschedule.
                            </p>

                            <p>
                                Best regards, <br>
                                Oliver
                            </p>

                        </div>
                    `,
                });
            }

            return participantId;
        }),
});
