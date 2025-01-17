import * as v from 'valibot';
import { ingameAuth } from '~/server/db/schema';

import { and, eq } from 'drizzle-orm';
import { db } from '~/server/db';

const ingameAuthLogoutInputSchema = v.object({
	id: v.pipe(v.string(), v.uuid()),
});
type IngameAutLogoutInput = v.InferInput<typeof ingameAuthLogoutInputSchema>;

export async function ingameAuthLogout(unsafeInput: IngameAutLogoutInput) {
	const input = v.parse(ingameAuthLogoutInputSchema, unsafeInput);

	const result = await db.delete(ingameAuth).where(and(eq(ingameAuth.id, input.id)));

	if (result.rowsAffected !== 1) {
		throw new Error('Session does not exist');
	}
}
