import * as v from 'valibot';

export class CookieDefinition<T> {
	readonly name: string;
	readonly schema: v.BaseSchema<string | null | undefined, T, v.BaseIssue<unknown>>;
	readonly maxAge: number;
	readonly httpOnly: boolean;
	readonly sameSite: 'strict' | 'lax' | 'none';

	constructor({
		name,
		schema,
		maxAge,
		httpOnly,
		sameSite,
	}: {
		name: string;
		schema: v.BaseSchema<string | null | undefined, T, v.BaseIssue<unknown>>;
		maxAge?: number;
		httpOnly?: boolean;
		sameSite?: 'strict' | 'lax' | 'none';
	}) {
		this.name = name;
		this.schema = schema;
		this.maxAge = maxAge ?? 60 * 60 * 24 * 365 * 1; // 1 year
		this.httpOnly = httpOnly ?? true;
		this.sameSite = sameSite ?? 'strict';
	}
}

export type CookieNameLike = string | CookieDefinition<unknown>;
export function getCookieName(name: CookieNameLike): string {
	return typeof name === 'string' ? name : name.name;
}

export const COOKIE_INGAME_AUTH_URL_ID = new CookieDefinition({
	name: 'ingameAuthUrlId',
	schema: v.nullish(v.pipe(v.string(), v.uuid())),
	maxAge: 60 * 15, // 15 minutes
	sameSite: 'lax', // not quite sure why this needs to be lax, but the cookie seems to be not present after the redirect from the discord login
});

export const COOKIE_THEME = new CookieDefinition({
	name: 'theme',
	schema: v.pipe(
		v.nullish(v.string()),
		v.transform((v) => (v === 'light' ? 'light' : 'dark')),
	),
	maxAge: 60 * 60 * 24 * 365 * 10, // 10 year
	httpOnly: false,
});
