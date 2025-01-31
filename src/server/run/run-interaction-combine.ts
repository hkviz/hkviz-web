import * as d3 from 'd3';
import { and, eq, inArray } from 'drizzle-orm';
import { type MySqlInsertValue } from 'drizzle-orm/mysql-core';
import { type DB } from '~/server/db';
import { runInteraction, runs } from '~/server/db/schema';

export async function runInteractionCombine(db: DB, chosenId: string, runIdsWithoutChosen: string[]) {
	const interactions = await db.query.runInteraction.findMany({
		where: (runInteraction, { and, inArray }) =>
			and(inArray(runInteraction.runId, [chosenId, ...runIdsWithoutChosen])),
	});

	if (interactions.length === 0) {
		return;
	}

	const groupedInteractions = d3.group(interactions, (i) => `${i.userId}_${i.type}`);

	for (const [, group] of groupedInteractions.entries()) {
		const { userId, type } = group[0]!;
		const kept = group.find((i) => i.runId === chosenId);

		const originalRunIds = group.flatMap((i) => i.originalRunIds);

		const result = kept
			? await db
					.update(runInteraction)
					.set({ originalRunIds: [...new Set([...kept.originalRunIds, ...originalRunIds])] })
					.where(
						and(
							eq(runInteraction.runId, chosenId),
							eq(runInteraction.userId, userId),
							eq(runInteraction.type, type),
						),
					)
			: await db.insert(runInteraction).values({ userId, runId: chosenId, originalRunIds, type });

		if (result.rowsAffected !== 1) {
			console.error('Failed to combine interactions', chosenId, userId, type, result.rowsAffected);
		}
	}

	// delete all interactions for not chosen runs
	await db.delete(runInteraction).where(inArray(runInteraction.runId, runIdsWithoutChosen));

	await db.update(runs).set({ likeCount: 0 }).where(inArray(runs.id, runIdsWithoutChosen));
	await db.update(runs).set({ likeCount: groupedInteractions.size }).where(eq(runs.id, chosenId));
}

export async function runInteractionUncombine(db: DB, runId: string) {
	const interactions = await db.query.runInteraction.findMany({
		where: (runInteraction, { eq }) => eq(runInteraction.runId, runId),
	});

	if (interactions.length === 0) {
		return;
	}

	const inserts: MySqlInsertValue<typeof runInteraction>[] = [];

	const likesPerRunId = new Map<string, number>();

	for (const interaction of interactions) {
		const { userId, type, originalRunIds } = interaction;

		originalRunIds.forEach((originalRunId) => {
			inserts.push({ userId, runId: originalRunId, originalRunIds: [originalRunId], type });
			likesPerRunId.set(originalRunId, (likesPerRunId.get(originalRunId) ?? 0) + 1);
		});
	}

	await db.delete(runInteraction).where(eq(runInteraction.runId, runId));
	if (inserts.length > 0) {
		await db.insert(runInteraction).values(inserts);
	}

	for (const [runId, likeCount] of likesPerRunId.entries()) {
		await db.update(runs).set({ likeCount }).where(eq(runs.id, runId));
	}
}
