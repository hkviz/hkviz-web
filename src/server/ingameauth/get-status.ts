import * as v from 'valibot';

import { db } from '~/server/db';

const ingameAuthGetStatusInputSchema = v.object({
	id: v.pipe(v.string(), v.uuid()),
});
type IngameAuthGetStatusInput = v.InferInput<typeof ingameAuthGetStatusInputSchema>;

export async function ingameAuthGetStatus(unsafeInput: IngameAuthGetStatusInput) {
	const input = v.parse(ingameAuthGetStatusInputSchema, unsafeInput);
	const session = await db.query.ingameAuth.findFirst({
		where: (ingameAuth, { eq }) => eq(ingameAuth.id, input.id),
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
