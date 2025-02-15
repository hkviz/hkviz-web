import { ingameAuth } from '~/server/db/schema';

import { action } from '@solidjs/router';
import { and, eq, isNull } from 'drizzle-orm';
import { COOKIE_INGAME_AUTH_URL_ID } from '~/lib/cookies/cookie-names';
import { jsonWithCookies } from '~/lib/cookies/cookies-response-helpers';
import { serverCookiesGet } from '~/lib/cookies/cookies-server';
import { raise } from '~/lib/parser';
import { db } from '~/server/db';
import { isMax10MinutesOld } from './utils';

export const ingameAuthCancelLogin = action(async () => {
	'use server';
	const cookies = await serverCookiesGet();
	const urlId = cookies.getSafe(COOKIE_INGAME_AUTH_URL_ID) ?? raise(new Error('Login failed. No login id found.'));

	const result = await db
		.delete(ingameAuth)
		.where(and(eq(ingameAuth.urlId, urlId), isNull(ingameAuth.userId), isMax10MinutesOld()));

	if (result.rowsAffected !== 1) {
		throw new Error('Unexpected session state');
	}

	cookies.delete(COOKIE_INGAME_AUTH_URL_ID);

	return jsonWithCookies({}, cookies);
});
