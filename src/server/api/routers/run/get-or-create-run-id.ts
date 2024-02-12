import { v4 as uuidv4 } from 'uuid';

import { type DB } from '~/server/db';
import { runLocalIds, runs } from '~/server/db/schema';

export async function getOrCreateRunId(db: DB, localId: string, userId: string): Promise<string> {
    const existingRunId = (
        await db.query.runLocalIds.findFirst({
            where: (runLocalId, { and, eq }) => and(eq(runLocalId.localId, localId), eq(runLocalId.userId, userId)),
            columns: {
                runId: true,
            },
        })
    )?.runId;

    if (existingRunId) {
        return existingRunId;
    }

    const newId = uuidv4();
    await db.insert(runs).values({
        id: newId,
        // TODO remove localId from here. its deprecated
        localId,
        userId,
    });
    await db.insert(runLocalIds).values({
        runId: newId,
        localId,
        userId,
    });

    return newId;
}
