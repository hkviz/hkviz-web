import { eq } from 'drizzle-orm';
import { type MySqlUpdateSetSource } from 'drizzle-orm/mysql-core';
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

    const startTimes = files.map((it) => it.startedAt?.getTime()).filter((it): it is number => !!it);
    const startedAt = startTimes.length > 0 ? new Date(Math.min(...startTimes)) : undefined;

    const updateSet: MySqlUpdateSetSource<typeof runs> = {
        startedAt,
    };

    for (const file of files) {
        updateSet.hkVersion = updateSet.hkVersion ?? file.hkVersion;
        updateSet.playTime = updateSet.playTime ?? file.playTime;
        updateSet.maxHealth = updateSet.maxHealth ?? file.maxHealth;
        updateSet.mpReserveMax = updateSet.mpReserveMax ?? file.mpReserveMax;
        updateSet.geo = updateSet.geo ?? file.geo;
        updateSet.dreamOrbs = updateSet.dreamOrbs ?? file.dreamOrbs;
        updateSet.permadeathMode = updateSet.permadeathMode ?? file.permadeathMode;
        updateSet.mapZone = updateSet.mapZone ?? file.mapZone;
        updateSet.killedHollowKnight = updateSet.killedHollowKnight ?? file.killedHollowKnight;
        updateSet.killedFinalBoss = updateSet.killedFinalBoss ?? file.killedFinalBoss;
        updateSet.killedVoidIdol = updateSet.killedVoidIdol ?? file.killedVoidIdol;
        updateSet.completionPercentage = updateSet.completionPercentage ?? file.completionPercentage;
        updateSet.unlockedCompletionRate = updateSet.unlockedCompletionRate ?? file.unlockedCompletionRate;
        updateSet.dreamNailUpgraded = updateSet.dreamNailUpgraded ?? file.dreamNailUpgraded;
        updateSet.lastScene = updateSet.lastScene ?? file.lastScene;
        updateSet.endedAt = updateSet.endedAt ?? file.endedAt;
    }

    await db.update(runs).set(updateSet).where(eq(runs.id, runId));
}
