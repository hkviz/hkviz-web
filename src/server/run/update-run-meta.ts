import { eq } from 'drizzle-orm';
import { type SQLiteUpdateSetSource } from 'drizzle-orm/sqlite-core';
import { type DB } from '~/server/db';
import { runs } from '~/server/db/schema';
import { runGameStateMetaColumnsSelect } from './run-column-selects';

export async function updateRunMetaByFiles(db: DB, runId: string) {
	const files = await db.query.runFiles.findMany({
		where: (runFile, { eq }) => eq(runFile.runId, runId),
		columns: {
			...runGameStateMetaColumnsSelect,
		},
		orderBy: (run, { desc }) => desc(run.endedAt),
	});

	const startTimes = files.map((it) => it.startedAt?.getTime()).filter((it) => it != null);
	const startedAt = startTimes.length > 0 ? new Date(Math.min(...startTimes)) : undefined;

	const updateSet: SQLiteUpdateSetSource<typeof runs> = {
		startedAt,
	};

	for (const file of files) {
		updateSet.gameVersion = updateSet.gameVersion ?? file.gameVersion;

		// -- shared --
		// time
		updateSet.playTime = updateSet.playTime ?? file.playTime;
		updateSet.endedAt = updateSet.endedAt ?? file.endedAt;

		// bools
		updateSet.unlockedCompletionRate = updateSet.unlockedCompletionRate ?? file.unlockedCompletionRate;

		// ints
		updateSet.completionPercentage = updateSet.completionPercentage ?? file.completionPercentage;
		updateSet.maxHealth = updateSet.maxHealth ?? file.maxHealth;
		updateSet.geo = updateSet.geo ?? file.geo;
		updateSet.permadeathMode = updateSet.permadeathMode ?? file.permadeathMode;

		// strings
		updateSet.lastScene = updateSet.lastScene ?? file.lastScene;

		// -- game specific --
		updateSet.mapZone = updateSet.mapZone ?? file.mapZone;

		// bools
		updateSet.gsBool1 = updateSet.gsBool1 ?? file.gsBool1;
		updateSet.gsBool2 = updateSet.gsBool2 ?? file.gsBool2;
		updateSet.gsBool3 = updateSet.gsBool3 ?? file.gsBool3;
		updateSet.gsBool4 = updateSet.gsBool4 ?? file.gsBool4;
		updateSet.gsBool5 = updateSet.gsBool5 ?? file.gsBool5;

		// ints
		updateSet.gsInt1 = updateSet.gsInt1 ?? file.gsInt1;
		updateSet.gsInt2 = updateSet.gsInt2 ?? file.gsInt2;
		updateSet.gsInt3 = updateSet.gsInt3 ?? file.gsInt3;
		updateSet.gsInt4 = updateSet.gsInt4 ?? file.gsInt4;

		// strings
		updateSet.gsString1 = updateSet.gsString1 ?? file.gsString1;
	}

	await db.update(runs).set(updateSet).where(eq(runs.id, runId));
}
