import { v4 as uuidv4 } from 'uuid';

import { type DB } from '~/server/db';
import { runs } from '~/server/db/schema';

export async function getOrCreateRunId(db: DB, localId: string, userId: string): Promise<string> {
    const existingRunId = (
        await db.query.runs.findFirst({
            where: (run, { and, eq }) => and(eq(run.localId, localId), eq(run.userId, userId)),
            columns: {
                id: true,
            },
        })
    )?.id;

    if (existingRunId) {
        return existingRunId;
    }

    const newId = uuidv4();
    await db.insert(runs).values({
        id: newId,
        localId,
        userId,
    });

    return newId;
}
