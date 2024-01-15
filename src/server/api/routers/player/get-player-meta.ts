import { sql } from 'drizzle-orm';
import { type Metadata } from 'next';
import { db } from '~/server/db';
import { runs } from '~/server/db/schema';

export async function getPlayerMeta(id: string): Promise<Metadata> {
    const data = await db.query.users.findFirst({
        where: (user, { eq }) => eq(user.id, id),
        columns: {
            name: true,
        },
        extras: {
            runCount: sql`(SELECT count(*) from ${runs})`.as('runCount'),
        },
    });

    if (!data || data.runCount === 0) {
        return {
            title: 'User not found - HKViz',
        };
    }
    return {
        title: `${data.name} - HKViz`,
        alternates: {
            canonical: `/player/${id}`,
        },
    };
}
