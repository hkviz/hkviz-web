import { and, eq, sql } from 'drizzle-orm';
import { type DB } from '~/server/db';
import { users } from '~/server/db/schema';

export async function isResearcher({ db, userId }: { db: DB; userId: string }) {
    const sqlStr = sql<string>;

    const result = await db
        .select({
            count: sqlStr`COUNT(*)`,
        })
        .from(users)
        .where(and(eq(users.id, userId), eq(users.isResearcher, true)));

    return result[0]?.count === '1';
}

export async function assertIsResearcher({
    db,
    userId,
    makeError = () => new Error('Forbidden'),
}: {
    db: DB;
    userId: string | null;
    makeError?: () => Error;
}) {
    if (!userId) throw makeError();
    if (!(await isResearcher({ db, userId }))) {
        throw makeError();
    }
}
