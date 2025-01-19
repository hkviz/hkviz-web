import { and, eq, isNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import * as v from 'valibot';
import { getSessionOrNull } from '~/lib/auth/shared';
import { COOKIE_INGAME_AUTH_URL_ID } from '~/lib/cookies/cookie-names';
import { redirectWithCookies } from '~/lib/cookies/cookies-response-helpers';
import { serverCookiesGet } from '~/lib/cookies/cookies-server';
import { db } from '../db';
import { ingameAuth } from '../db/schema';
import { isMax10MinutesOld } from './utils';

const ingameAuthGetForAuthUrlInputSchema = v.object({
	urlId: v.union([v.pipe(v.string(), v.uuid()), v.literal('continue')]),
});
type IngameAuthGetForAuthUrlInput = v.InferInput<typeof ingameAuthGetForAuthUrlInputSchema>;

export async function ingameAuthGetByUrlId(unsafeInput: IngameAuthGetForAuthUrlInput) {
	'use server';
	const input = v.parse(ingameAuthGetForAuthUrlInputSchema, unsafeInput);

	const cookies = await serverCookiesGet();
	const isUrlIdFromUrl = input.urlId != 'continue';
	const urlId = isUrlIdFromUrl
		? // when a urlId is provided use it
			input.urlId
		: // when no urlId is provided try to use the one from the cookie
			cookies.getSafe(COOKIE_INGAME_AUTH_URL_ID);

	if (urlId == null) {
		return redirectWithCookies('/ingameauth/flow/not-found?1', cookies);
	}

	const session = await getSessionOrNull();
	const hasSession = session != null;

	console.log({ session, hasSession, isUrlIdFromUrl, urlId });

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
		return redirectWithCookies('/ingameauth/flow/not-found?2', cookies);
	}

	if (isUrlIdFromUrl) {
		// ---------- URL ID FROM URL ----------
		// Here the url id was visible in the url bar of the browser.
		// It should be ensured that the same url cannot be used again by anybody else.
		// For example, if the person doing the login is streaming, nobody else should be able
		// to login into their game.
		const newUrlId = uuidv4();
		const result = await db
			.update(ingameAuth)
			.set({ urlId: newUrlId })
			.where(and(eq(ingameAuth.urlId, urlId), isNull(ingameAuth.userId), isMax10MinutesOld()));

		if (result.rowsAffected !== 1) {
			return redirectWithCookies('/ingameauth/flow/not-found?3', cookies);
		}

		cookies.set(COOKIE_INGAME_AUTH_URL_ID, newUrlId);
	} else {
		// ---------- URL ID FROM COOKIE ----------
		// Here the url id was not visible in the url bar of the browser.
		// It can be kept
		cookies.set(COOKIE_INGAME_AUTH_URL_ID, urlId);
	}
	if (hasSession) {
		return redirectWithCookies('/ingameauth/flow/confirm', cookies);
	} else {
		return redirectWithCookies('/api/auth/signin?callbackUrl=/ingameauth/continue', cookies);
	}
}
