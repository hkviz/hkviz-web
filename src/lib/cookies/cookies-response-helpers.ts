import { CustomResponse, json, RouterResponseInit } from '@solidjs/router';
import { ServerCookies, serverCookiesGet } from './cookies-server';
import { combineHeaders } from './headers';

type Params = Parameters<typeof json>;
type Response = ReturnType<typeof json>;

export function jsonWithCookies<T>(data: T, cookies: ServerCookies, init?: RouterResponseInit): CustomResponse<T> {
	let initModified = init;

	const headers = cookies.getSetHeaders();

	if (headers.length) {
		initModified ??= {};
		initModified.headers = combineHeaders(initModified.headers, headers);
	}

	return json(data, initModified);
}
