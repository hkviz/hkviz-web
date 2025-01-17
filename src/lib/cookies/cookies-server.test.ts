import { afterAll, afterEach, beforeEach, expect, test, vi } from 'vitest';
import { serverCookiesGet } from './cookies-server';
import { revalidate } from '@solidjs/router';

let currentCookieHeader = '';
vi.mock('vinxi/http', async (importOriginal) => {
	return {
		...(await importOriginal<typeof import('vinxi/http')>()),
		getWebRequest: () => ({
			headers: new Map([['cookie', currentCookieHeader]]),
		}),
	};
});

afterAll(() => {
	vi.clearAllMocks();
});

beforeEach(() => {
	currentCookieHeader = '';
	revalidate(serverCookiesGet.key);
});

test('parses simple cookies', async () => {
	currentCookieHeader = 'name=value; name2=value2'; // update for this test
	const cookies = await serverCookiesGet();

	expect(cookies.getAll()).toEqual(
		new Map([
			['name', 'value'],
			['name2', 'value2'],
		]),
	);
	expect(cookies.get('name')).toBe('value');
	expect(cookies.get('name2')).toBe('value2');
});

test('parses cookies with spaces', async () => {
	currentCookieHeader = 'name=value; name2=value2; name3=value 3'; // update for this test
	const cookies = await serverCookiesGet();

	expect(cookies.getAll()).toEqual(
		new Map([
			['name', 'value'],
			['name2', 'value2'],
			['name3', 'value 3'],
		]),
	);
	expect(cookies.get('name')).toBe('value');
	expect(cookies.get('name2')).toBe('value2');
	expect(cookies.get('name3')).toBe('value 3');
});

test('sets cookie correctly', async () => {
	const cookies = await serverCookiesGet();
	cookies.set('name', 'value');
	expect(cookies.getHeaders()).toEqual([['Set-Cookie', 'name=value']]);
	expect(cookies.getAll()).toEqual(new Map([['name', 'value']]));
});

test('deletes cookie correctly', async () => {
	currentCookieHeader = 'name=value'; // update for this test
	const cookies = await serverCookiesGet();
	cookies.delete('name');

	expect(cookies.getHeaders()).toEqual([['Set-Cookie', 'name=; Max-Age=-1']]);
	expect(cookies.getAll()).toEqual(new Map());
});

test('deduplicates set headers', async () => {
	// initial values
	const cookies = await serverCookiesGet();
	cookies.set('name', 'value');
	cookies.set('name2', 'value2');

	expect(cookies.getHeaders()).toEqual([
		['Set-Cookie', 'name=value'],
		['Set-Cookie', 'name2=value2'],
	]);
	expect(cookies.getAll()).toEqual(
		new Map([
			['name', 'value'],
			['name2', 'value2'],
		]),
	);

	// update values
	cookies.set('name', 'new-value');

	expect(cookies.getHeaders()).toEqual([
		['Set-Cookie', 'name=new-value'],
		['Set-Cookie', 'name2=value2'],
	]);
	expect(cookies.getAll()).toEqual(
		new Map([
			['name', 'new-value'],
			['name2', 'value2'],
		]),
	);

	// delete values
	cookies.delete('name');

	expect(cookies.getHeaders()).toEqual([
		['Set-Cookie', 'name=; Max-Age=-1'],
		['Set-Cookie', 'name2=value2'],
	]);
	expect(cookies.getAll()).toEqual(new Map([['name2', 'value2']]));
});
