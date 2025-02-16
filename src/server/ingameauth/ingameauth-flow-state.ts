import { and, eq, isNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { getSessionOrNull } from '~/lib/auth/shared';
import { COOKIE_INGAME_AUTH_URL_ID } from '~/lib/cookies/cookie-names';
import { redirectWithCookies } from '~/lib/cookies/cookies-response-helpers';
import { serverCookiesGet } from '~/lib/cookies/cookies-server';
import { assertNever } from '~/lib/parser';
import { db } from '../db';
import { ingameAuth } from '../db/schema';
import { isMax10MinutesOld } from './utils';
import { accountGetScheduledForDeletion } from '../account/deletion';

export type IngameAuthFlowState =
	| { type: 'no-id-provided' }
	| { type: 'not-found'; count: number }
	| { type: 'sign-in-required' }
	| { type: 'cancel-account-deletion' }
	| { type: 'final-accept'; urlId: string };

export async function getIngameAuthFlowState(urlIdOrContinue: string = 'continue'): Promise<IngameAuthFlowState> {
	const cookies = await serverCookiesGet();
	const isUrlIdFromUrl = urlIdOrContinue != 'continue';
	const urlId = isUrlIdFromUrl
		? // when a urlId is provided use it
			urlIdOrContinue
		: // when no urlId is provided try to use the one from the cookie
			cookies.getSafe(COOKIE_INGAME_AUTH_URL_ID);

	if (urlId == null) {
		return { type: 'no-id-provided' };
	}

	const result = await db.query.ingameAuth.findFirst({
		where: (ingameAuth, { eq, and }) =>
			and(eq(ingameAuth.urlId, urlId), isNull(ingameAuth.userId), isMax10MinutesOld()),
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

	if (result == null) {
		return { type: 'not-found', count: 1 };
	}

	let afterChangeUrlId = urlId;

	if (isUrlIdFromUrl) {
		// ---------- URL ID FROM URL ----------
		// Here the url id was visible in the url bar of the browser.
		// It should be ensured that the same url cannot be used again by anybody else.
		// For example, if the person doing the login is streaming, nobody else should be able
		// to login into their game.
		const newUrlId = uuidv4();
		afterChangeUrlId = newUrlId;
		const result = await db
			.update(ingameAuth)
			.set({ urlId: newUrlId })
			.where(and(eq(ingameAuth.urlId, urlId), isNull(ingameAuth.userId), isMax10MinutesOld()));

		if (result.rowsAffected !== 1) {
			return { type: 'not-found', count: 2 };
		}

		cookies.set(COOKIE_INGAME_AUTH_URL_ID, newUrlId);
	} else {
		// ---------- URL ID FROM COOKIE ----------
		// Here the url id was not visible in the url bar of the browser.
		// It can be kept
		cookies.set(COOKIE_INGAME_AUTH_URL_ID, urlId);
	}

	const session = await getSessionOrNull();
	if (!session?.user?.id) {
		return { type: 'sign-in-required' };
	}

	const accountMarkedForDeletion = await accountGetScheduledForDeletion();
	if (accountMarkedForDeletion) {
		return { type: 'cancel-account-deletion' };
	}
	return { type: 'final-accept', urlId: afterChangeUrlId };
}

export async function getIngameAuthRedirect(state: IngameAuthFlowState) {
	const cookies = await serverCookiesGet();
	switch (state.type) {
		case 'no-id-provided':
			return redirectWithCookies('/ingameauth/flow/not-found?no-id', cookies);
		case 'not-found':
			return redirectWithCookies('/ingameauth/flow/not-found?' + state.count, cookies);
		case 'sign-in-required':
			return redirectWithCookies('/api/auth/signin?callbackUrl=/ingameauth/continue', cookies);
		case 'cancel-account-deletion':
			return redirectWithCookies('/ingameauth/flow/account-deleted', cookies);
		case 'final-accept':
			return redirectWithCookies('/ingameauth/flow/confirm', cookies);
		default:
			assertNever(state);
	}
}
