import { CustomResponse, json, RouterResponseInit } from '@solidjs/router';
import { ServerCookies } from './cookies-server';
import { combineHeaders } from './headers';

export function jsonWithCookies<T>(data: T, cookies: ServerCookies, init?: RouterResponseInit): CustomResponse<T> {
	let initModified = init;

	const headers = cookies.getSetHeaders();

	if (headers.length) {
		initModified ??= {};
		initModified.headers = combineHeaders(initModified.headers, headers);
	}

	return json(data, initModified);
}
