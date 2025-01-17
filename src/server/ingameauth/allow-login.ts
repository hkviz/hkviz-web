import * as v from 'valibot';
import { ingameAuth } from '~/server/db/schema';

import { and, eq, isNull } from 'drizzle-orm';
import { getUserOrThrow } from '~/lib/auth/shared';
import { COOKIE_NAME_INGAME_AUTH_URL_ID } from '~/lib/cookies/cookie-names';
import { jsonWithCookies } from '~/lib/cookies/cookies-response-helpers';
import { serverCookiesGet } from '~/lib/cookies/cookies-server';
import { db } from '~/server/db';
import { isMax10MinutesOld } from './utils';

const ingameAuthAllowLoginInputSchema = v.object({
	id: v.pipe(v.string(), v.uuid()),
});
type IngameAuthAllowLoginInput = v.InferInput<typeof ingameAuthAllowLoginInputSchema>;

export async function ingameAuthAllowLogin(unsafeInput: IngameAuthAllowLoginInput) {
	const input = v.parse(ingameAuthAllowLoginInputSchema, unsafeInput);
	const user = await getUserOrThrow();

	const userId = user.id;
	const result = await db
		.update(ingameAuth)
		.set({ userId })
		.where(and(eq(ingameAuth.id, input.id), isNull(ingameAuth.userId), isMax10MinutesOld()));

	if (result.rowsAffected !== 1) {
		throw new Error('Unexpected session state');
	}

	const cookies = await serverCookiesGet();
	cookies.delete(COOKIE_NAME_INGAME_AUTH_URL_ID);

	return jsonWithCookies({}, cookies);
}
