import * as v from 'valibot';
import { ingameAuth } from '~/server/db/schema';

import { and, eq, isNull } from 'drizzle-orm';
import { db } from '~/server/db';
import { isMax10MinutesOld } from './utils';

const ingameAuthRemoveUrlIdInputSchema = v.object({
	id: v.pipe(v.string(), v.uuid()),
});
type IngameAuthRemoveUrlIdInput = v.InferInput<typeof ingameAuthRemoveUrlIdInputSchema>;

export async function ingameAuthRemoveUrlId(unsafeInput: IngameAuthRemoveUrlIdInput) {
	const input = v.parse(ingameAuthRemoveUrlIdInputSchema, unsafeInput);
	const result = await db
		.update(ingameAuth)
		.set({ urlId: null })
		.where(and(eq(ingameAuth.id, input.id), isNull(ingameAuth.userId), isMax10MinutesOld()));

	if (result.rowsAffected !== 1) {
		throw new Error('Session does not exist');
	}
}
