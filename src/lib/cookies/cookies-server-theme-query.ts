import { query } from '@solidjs/router';
import { serverCookiesGet } from './cookies-server';

export const serverCookiesGetTheme = query(async () => {
	'use server';
	const cookies = await serverCookiesGet();
	return cookies.get('theme') === 'light' ? 'light' : 'dark';
}, 'get-cookies-theme-server');
