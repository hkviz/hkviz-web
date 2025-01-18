import { and, eq, sql } from 'drizzle-orm';
import { runInteraction, runs } from '~/server/db/schema';
import { db } from '../db';

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
