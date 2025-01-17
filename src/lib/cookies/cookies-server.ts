import { query } from '@solidjs/router';
import { parse, serialize } from 'cookie';
import { getWebRequest } from 'vinxi/http';

class ServerCookies {
	#cookies = new Map<string, string>();
	#headers = new Map<string, [string, string]>();

	constructor(cookies: Record<string, string | undefined>) {
		for (const [name, value] of Object.entries(cookies)) {
			if (value != null) {
				this.#cookies.set(name, value);
			}
		}
	}

	set(name: string, value: string, options: { maxAge?: number } = {}) {
		const setCookieHeader = serialize(name, value, options);
		this.#headers.set(name, ['Set-Cookie', setCookieHeader]);
		this.#cookies.set(name, value);
	}

	delete(name: string) {
		const deleteCookieHeader = serialize(name, '', { maxAge: -1 });
		this.#headers.set(name, ['Set-Cookie', deleteCookieHeader]);
		this.#cookies.delete(name);
	}

	get(name: string): string | undefined {
		return this.#cookies.get(name);
	}

	getAll(): ReadonlyMap<string, string> {
		return this.#cookies;
	}

	getHeaders() {
		return Array.from(this.#headers.values());
	}
}

export const serverCookiesGet = query(async () => {
	const request = getWebRequest();
	const cookie = request.headers.get('cookie') || '';
	const cookies = parse(cookie);
	return new ServerCookies(cookies);
}, 'get-cookies-server');
