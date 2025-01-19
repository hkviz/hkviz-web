import { CustomResponse, json, redirect, RouterResponseInit } from '@solidjs/router';
import { ServerCookies } from './cookies-server';
import { combineHeaders } from './headers';

export function withCookies(
	cookies: ServerCookies,
	init?: RouterResponseInit | undefined,
): RouterResponseInit | undefined {
	let initModified = init;

	const headers = cookies.getSetHeaders();
	console.log({ headers });

	if (headers.length) {
		initModified ??= {};
		initModified.headers = combineHeaders(initModified.headers, headers);
	}

	return initModified;
}

export function jsonWithCookies<T>(data: T, cookies: ServerCookies, init?: RouterResponseInit): CustomResponse<T> {
	const initModified = withCookies(cookies, init);
	console.log(JSON.stringify({ initModified }, null, 2));
	return json(data, initModified);
}

export function redirectWithCookies(
	url: string,
	cookies: ServerCookies,
	init?: RouterResponseInit,
): CustomResponse<never> {
	const initModified = withCookies(cookies, init);
	return redirect(url, initModified);
}
