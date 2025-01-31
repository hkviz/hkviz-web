import { v4 as uuidv4 } from 'uuid';
import * as v from 'valibot';
import { ingameAuth } from '~/server/db/schema';

import { and, eq, isNull } from 'drizzle-orm';
import { db } from '~/server/db';
import { isMax10MinutesOld } from './utils';

const ingameAuthChangeUrlIdInputSchema = v.object({
	id: v.pipe(v.string(), v.uuid()),
});
type IngameAutChangeUrlIdInput = v.InferInput<typeof ingameAuthChangeUrlIdInputSchema>;

export async function ingameAuthChangeUrlId(unsafeInput: IngameAutChangeUrlIdInput) {
	const input = v.parse(ingameAuthChangeUrlIdInputSchema, unsafeInput);
	const newUrlId = uuidv4();
	const result = await db
		.update(ingameAuth)
		.set({ urlId: newUrlId })
		.where(and(eq(ingameAuth.id, input.id), isNull(ingameAuth.userId), isMax10MinutesOld()));

	if (result.rowsAffected !== 1) {
		throw new Error('Session does not exist');
	}
	return newUrlId;
}
