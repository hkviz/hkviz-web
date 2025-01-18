import { query } from '@solidjs/router';
import { parse, serialize } from 'cookie';
import { getWebRequest } from 'vinxi/http';

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

	set(name: string, value: string, options: { maxAge?: number } = {}) {
		const setCookieHeader = serialize(name, value, options);
		this.#setHeaders.set(name, ['Set-Cookie', setCookieHeader]);
		this.#cookies.set(name, value);
	}

	delete(name: string) {
		const deleteCookieHeader = serialize(name, '', { maxAge: -1 });
		this.#setHeaders.set(name, ['Set-Cookie', deleteCookieHeader]);
		this.#cookies.delete(name);
	}

	get(name: string): string | undefined {
		if (!this.#didParse && !this.#setHeaders.has(name)) {
			this.#ensureParsed();
		}
		return this.#cookies.get(name);
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
