import { v4 as uuidv4 } from 'uuid';
import { ingameAuth } from '~/server/db/schema';
import * as v from 'valibot';

import { and, eq, gte, isNull } from 'drizzle-orm';
import { db } from '~/server/db';
import { raise } from '~/lib/parser';
import { isMax10MinutesOld } from './utils';
import { getUserOrThrow } from '~/lib/auth/shared';
import { serverCookiesGet } from '~/lib/cookies/cookies-server';
import { COOKIE_NAME_INGAME_AUTH_URL_ID } from '~/lib/cookies/cookie-names';
import { jsonWithCookies } from '~/lib/cookies/cookies-response-helpers';

const ingameAuthCancelLoginInputSchema = v.object({
	id: v.pipe(v.string(), v.uuid()),
});
type IngameAuthCancelLoginInput = v.InferInput<typeof ingameAuthCancelLoginInputSchema>;

export async function ingameAuthCancelLogin(unsafeInput: IngameAuthCancelLoginInput) {
	const input = v.parse(ingameAuthCancelLoginInputSchema, unsafeInput);
	const result = await db
		.delete(ingameAuth)
		.where(and(eq(ingameAuth.id, input.id), isNull(ingameAuth.userId), isMax10MinutesOld()));

	if (result.rowsAffected !== 1) {
		throw new Error('Unexpected session state');
	}

	const cookies = await serverCookiesGet();

	cookies.delete(COOKIE_NAME_INGAME_AUTH_URL_ID);

	return jsonWithCookies({}, cookies);
}
