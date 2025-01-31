import * as v from 'valibot';

import { db } from '~/server/db';
import { isMax10MinutesOld } from './utils';

const ingameAuthGetByUrlIdIfNewSchema = v.object({
	urlId: v.pipe(v.string(), v.uuid()),
});
type IngameAuthGetByUrlIdIfNewInput = v.InferInput<typeof ingameAuthGetByUrlIdIfNewSchema>;

export async function ingameAuthGetByUrlIdIfNewAndGetNewUrlId(unsafeInput: IngameAuthGetByUrlIdIfNewInput) {
	const input = v.parse(ingameAuthGetByUrlIdIfNewSchema, unsafeInput);
	const session = await db.query.ingameAuth.findFirst({
		where: (ingameAuth, { eq, and }) => and(eq(ingameAuth.urlId, input.urlId), isMax10MinutesOld()),
		columns: {
			id: true,
			name: true,
		},
		with: {
			user: {
				columns: {
					id: true,
					name: true,
				},
			},
		},
	});

	return session;
}
