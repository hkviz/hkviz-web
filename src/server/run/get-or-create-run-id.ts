import { v4 as uuidv4 } from 'uuid';
import { GameId } from '~/lib/types/game-ids';

import { type DB } from '~/server/db';
import { runLocalIds, runs } from '~/server/db/schema';

export async function getOrCreateRunId(db: DB, localId: string, userId: string, game: GameId): Promise<string> {
	const existing = await db.query.runLocalIds.findFirst({
		where: (runLocalId, { and, eq }) => and(eq(runLocalId.localId, localId), eq(runLocalId.userId, userId)),
		columns: {
			runId: true,
			game: true,
		},
	});

	console.log('Existing run local ID', existing, 'for localId', localId, 'userId', userId, game);

	if (existing && existing.game !== game) {
		throw new Error('Local ID already exists for a different game. Cannot reuse local IDs across games');
	}

	if (existing) {
		return existing.runId;
	}

	const newId = uuidv4();
	await db.insert(runs).values({
		id: newId,
		userId,
		game,
	});
	await db.insert(runLocalIds).values({
		runId: newId,
		localId,
		userId,
		originalRunId: newId,
		game,
	});

	return newId;
}
