import { query } from '@solidjs/router';
import { parse, serialize } from 'cookie';
import * as v from 'valibot';
import { CookieSerializeOptions, getWebRequest } from 'vinxi/http';
import { CookieDefinition, CookieNameLike, getCookieName } from './cookie-names';

export class ServerCookies {
	#cookies = new Map<string, string>();
	#setHeaders = new Map<string, [string, string]>();

	#initialHeader: string;
	#didParse = false;

	get didParse() {
		return this.#didParse;
	}

	constructor(cookieHeader: string) {
		this.#initialHeader = cookieHeader;
	}

	#ensureParsed() {
		if (this.#didParse) {
			return;
		}

		this.#didParse = true;
		const cookies = parse(this.#initialHeader);
		for (const [name, value] of Object.entries(cookies)) {
			if (value !== undefined && this.#setHeaders.get(name) === undefined) {
				// Only set the cookie if it hasn't been set before
				this.#cookies.set(name, value);
			}
		}
	}

	set<T>(definition: CookieDefinition<T>, value: string, options: CookieSerializeOptions = {}) {
		const optionsWithDefaults = options ?? {};
		optionsWithDefaults.path ??= '/';
		optionsWithDefaults.httpOnly ??= definition.httpOnly;
		optionsWithDefaults.sameSite ??= definition.sameSite;
		optionsWithDefaults.maxAge ??= definition.maxAge;

		const _name = getCookieName(definition);
		const setCookieHeader = serialize(_name, value, options);
		this.#setHeaders.set(_name, ['Set-Cookie', setCookieHeader]);
		this.#cookies.set(_name, value);
	}

	delete(name: CookieNameLike) {
		const _name = typeof name === 'string' ? name : name.name;
		const deleteCookieHeader = serialize(_name, '', { maxAge: -1, path: '/' });
		this.#setHeaders.set(_name, ['Set-Cookie', deleteCookieHeader]);
		this.#cookies.delete(_name);
	}

	get(name: string): string | undefined {
		if (!this.#didParse && !this.#setHeaders.has(name)) {
			this.#ensureParsed();
		}
		return this.#cookies.get(name);
	}

	getSafe<T>(definition: CookieDefinition<T>): T {
		const value = this.get(definition.name);
		return v.parse(definition.schema, value);
	}

	getAll(): ReadonlyMap<string, string> {
		this.#ensureParsed();
		return this.#cookies;
	}

	getSetHeaders() {
		return Array.from(this.#setHeaders.values());
	}
}

export const serverCookiesGet = query(async () => {
	const request = getWebRequest();
	const cookie = request.headers.get('cookie') || '';
	return new ServerCookies(cookie);
}, 'get-cookies-server');

export function serverCookiesGetSyncDontUse() {
	// TODO would be nice to not double parse cookies on initial page requests
	const request = getWebRequest();
	const cookie = request.headers.get('cookie') || '';
	return new ServerCookies(cookie);
}
