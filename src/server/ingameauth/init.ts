import { v4 as uuidv4 } from 'uuid';
import * as v from 'valibot';
import { ingameAuth } from '~/server/db/schema';

import { db } from '~/server/db';

const ingameAuthInitInputSchema = v.object({
	modVersion: v.nullish(v.string(), null),
});
type IngameAuthInitInput = v.InferInput<typeof ingameAuthInitInputSchema>;

export async function ingameAuthInit(unsafeInput: IngameAuthInitInput) {
	const input = v.parse(ingameAuthInitInputSchema, unsafeInput);
	const id = uuidv4();
	const urlId = uuidv4();
	await db.insert(ingameAuth).values({
		id,
		urlId,
		name: '',
	});

	return {
		id,
		urlId,
	};
}
