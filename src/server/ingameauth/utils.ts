import { ingameAuth } from '~/server/db/schema';

import { gte } from 'drizzle-orm';
import { raise } from '~/lib/parser';
import { db } from '~/server/db';

export function isMax10MinutesOld() {
	const someMinutesAgo = new Date(Date.now() - 1000 * 60 * 10);
	return gte(ingameAuth.createdAt, someMinutesAgo);
}

export async function getUserIdFromIngameSession(db_: typeof db, id: string) {
	return (
		(
			await db_.query.ingameAuth.findFirst({
				where: (ingameAuth, { eq }) => eq(ingameAuth.id, id),
				columns: {
					userId: true,
				},
			})
		)?.userId ?? raise(new Error('Could not find session'))
	);
}
