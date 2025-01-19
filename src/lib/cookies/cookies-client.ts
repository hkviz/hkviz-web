import { CookieDefinition, CookieNameLike, getCookieName } from './cookie-names';
import * as v from 'valibot';

export function cookiesClientSet(name: CookieNameLike, value: string, days: number) {
	const _name = getCookieName(name);
	let expires: string;
	if (days) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = '; expires=' + date.toUTCString();
	} else {
		expires = '';
	}
	document.cookie = _name + '=' + value + expires + '; path=/';
}

export function cookiesClientRead<T>(definition: CookieDefinition<T>): T {
	const nameEQ = definition.name + '=';
	const ca = document.cookie.split(';');
	for (let c of ca) {
		while (c.startsWith(' ')) {
			c = c.substring(1, c.length);
		}
		if (c.startsWith(nameEQ)) {
			return v.parse(definition.schema, c.substring(nameEQ.length, c.length));
		}
	}
	return v.parse(definition.schema, null);
}

export function cookiesClientDelete(name: string) {
	cookiesClientSet(name, '', -1);
}
