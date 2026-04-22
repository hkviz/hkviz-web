import { sql } from 'drizzle-orm';
import { getUserOrThrow } from '~/lib/auth/shared';
import { getTagDBColumn } from '~/lib/types/tags/tag_db_column';
import { tags } from '~/lib/types/tags/tags';
import { db } from '~/server/db';
import { runs } from '~/server/db/schema';
import { assertIsResearcher } from '~/server/researcher';

export async function GET() {
	const user = await getUserOrThrow();
	await assertIsResearcher({ db, userId: user.id });
	const result = await db
		.select(
			Object.fromEntries(
				tags.map((tag) => [
					tag.code,
					sql<number>`sum(case when ${runs[getTagDBColumn(tag.code)]} = 1 and ${runs.game} in ${tag.games} then 1 else 0 end)`,
				]),
			),
		)
		.from(runs);

	const row = result[0];

	const tagStats = tags.map((tag) => ({
		tagCode: tag.code,
		count: row[tag.code] ?? 0,
	}));

	return new Response(JSON.stringify(tagStats), {
		headers: { 'Content-Type': 'application/json' },
	});
}
