import { action } from '@solidjs/router';
import { and, eq, sql } from 'drizzle-orm';
import * as v from 'valibot';
import { getUserOrThrow } from '~/lib/auth/shared';
import { runInteraction, runs } from '~/server/db/schema';
import { db } from '../db';

const runInteractionLikeInputSchema = v.object({
	runId: v.pipe(v.string(), v.uuid()),
});
type RunInteractionLikeInput = v.InferOutput<typeof runInteractionLikeInputSchema>;

export const runInteractionLike = action(async (unsafeInput: RunInteractionLikeInput) => {
	'use server';
	const user = await getUserOrThrow();
	const input = v.parse(runInteractionLikeInputSchema, unsafeInput);
	await db.transaction(async (db) => {
		const run = await db.query.runs.findFirst({
			where: eq(runs.id, input.runId),
			columns: { id: true },
		});
		if (!run) {
			throw new Error('Run not found');
		}

		const userId = user.id;

		const existing = await db.query.runInteraction.findFirst({
			where: (runInteraction, { eq, and }) =>
				and(
					eq(runInteraction.userId, userId),
					eq(runInteraction.runId, input.runId),
					eq(runInteraction.type, 'like'),
				),
		});

		if (existing) return;

		const result = await db.insert(runInteraction).values({
			userId,
			runId: input.runId,
			type: 'like',
			originalRunIds: [input.runId],
		});
		if (result.rowsAffected !== 1) {
			console.error('Failed to like run', input.runId, userId, result.rowsAffected);
		}
		if (result.rowsAffected !== 0) {
			await db
				.update(runs)
				.set({ likeCount: sql`${runs.likeCount} + ${result.rowsAffected}` })
				.where(eq(runs.id, input.runId));
		}
	});
});

const runInteractionUnlikeInputSchema = v.object({
	runId: v.pipe(v.string(), v.uuid()),
});
type RunInteractionUnlikeInput = v.InferOutput<typeof runInteractionLikeInputSchema>;

export const runInteractionUnlike = action(async (unsafeInput: RunInteractionUnlikeInput) => {
	'use server';
	const user = await getUserOrThrow();
	const input = v.parse(runInteractionUnlikeInputSchema, unsafeInput);
	runInteractionUnlikeInternal({ runId: input.runId, userId: user.id });
});

export async function runInteractionUnlikeInternal(input: { runId: string; userId: string }) {
	await db.transaction(async (db) => {
		const run = await db.query.runs.findFirst({
			where: eq(runs.id, input.runId),
			columns: { id: true },
		});
		if (!run) {
			throw new Error('Run not found');
		}

		const result = await db
			.delete(runInteraction)
			.where(
				and(
					eq(runInteraction.userId, input.userId),
					eq(runInteraction.runId, input.runId),
					eq(runInteraction.type, 'like'),
				),
			);

		if (result.rowsAffected > 1) {
			console.error('Deleted more than one like', input.runId, input.userId, result.rowsAffected);
		}
		if (result.rowsAffected !== 0) {
			await db
				.update(runs)
				.set({ likeCount: sql`${runs.likeCount} - ${result.rowsAffected}` })
				.where(eq(runs.id, input.runId));
		}
	});
}
