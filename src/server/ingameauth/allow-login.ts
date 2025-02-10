import { ingameAuth } from '~/server/db/schema';

import { action } from '@solidjs/router';
import { and, eq, isNull } from 'drizzle-orm';
import { getUserOrThrow } from '~/lib/auth/shared';
import { COOKIE_INGAME_AUTH_URL_ID } from '~/lib/cookies/cookie-names';
import { jsonWithCookies } from '~/lib/cookies/cookies-response-helpers';
import { serverCookiesGet } from '~/lib/cookies/cookies-server';
import { db } from '~/server/db';
import { getIngameAuthFlowState, getIngameAuthRedirect } from './ingameauth-flow-state';
import { isMax10MinutesOld } from './utils';

export const ingameAuthAllowLogin = action(async () => {
	'use server';
	const user = await getUserOrThrow();
	const userId = user.id;

	const flowState = await getIngameAuthFlowState();
	if (flowState.type !== 'final-accept') {
		// should not be able to accept login yet
		return await getIngameAuthRedirect(flowState);
	}

	const cookies = await serverCookiesGet();

	const result = await db
		.update(ingameAuth)
		.set({ userId })
		.where(and(eq(ingameAuth.urlId, flowState.urlId), isNull(ingameAuth.userId), isMax10MinutesOld()));

	if (result.rowsAffected !== 1) {
		throw new Error('Unexpected session state');
	}

	cookies.delete(COOKIE_INGAME_AUTH_URL_ID);

	return jsonWithCookies({}, cookies);
});
