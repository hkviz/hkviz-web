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
	expect(cookies.getSetHeaders()).toEqual([['Set-Cookie', 'name=value']]);
	expect(cookies.getAll()).toEqual(new Map([['name', 'value']]));
});

test('deletes cookie correctly', async () => {
	currentCookieHeader = 'name=value'; // update for this test
	const cookies = await serverCookiesGet();
	cookies.delete('name');

	expect(cookies.getSetHeaders()).toEqual([['Set-Cookie', 'name=; Max-Age=-1']]);
	expect(cookies.getAll()).toEqual(new Map());
});

test('deduplicates set headers', async () => {
	// initial values
	const cookies = await serverCookiesGet();
	cookies.set('name', 'value');
	cookies.set('name2', 'value2');

	expect(cookies.getSetHeaders()).toEqual([
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

	expect(cookies.getSetHeaders()).toEqual([
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

	expect(cookies.getSetHeaders()).toEqual([
		['Set-Cookie', 'name=; Max-Age=-1'],
		['Set-Cookie', 'name2=value2'],
	]);
	expect(cookies.getAll()).toEqual(new Map([['name2', 'value2']]));
});

test('does not parse cookies if noting is read', async () => {
	currentCookieHeader = 'name=value';
	const cookies = await serverCookiesGet();
	expect(cookies.didParse).toBe(false);
});

test('parses cookies if get is called', async () => {
	currentCookieHeader = 'name=value';
	const cookies = await serverCookiesGet();
	cookies.get('name');
	expect(cookies.didParse).toBe(true);
});

test('parses cookies if getAll is called', async () => {
	currentCookieHeader = 'name=value';
	const cookies = await serverCookiesGet();
	cookies.getAll();
	expect(cookies.didParse).toBe(true);
});

test('does not parse cookies if getHeaders is called', async () => {
	currentCookieHeader = 'name=value';
	const cookies = await serverCookiesGet();
	cookies.getSetHeaders();
	expect(cookies.didParse).toBe(false);
});

test('does not parse cookies when reading already set cookie', async () => {
	currentCookieHeader = 'name=value';
	const cookies = await serverCookiesGet();
	cookies.set('name2', 'value2');
	expect(cookies.get('name2')).toBe('value2');
	expect(cookies.didParse).toBe(false);
});

test('does not parse cookies when reading already set cookie', async () => {
	currentCookieHeader = 'name=value';
	const cookies = await serverCookiesGet();
	cookies.delete('name');
	expect(cookies.get('name')).toBe(undefined);
	expect(cookies.didParse).toBe(false);
});

test('does not overwrite already set cookie when parsing after set', async () => {
	currentCookieHeader = 'name=value; name2=value2';
	const cookies = await serverCookiesGet();
	cookies.set('name', 'new-value');
	expect(cookies.get('name')).toBe('new-value');
	expect(cookies.didParse).toBe(false);

	expect(cookies.get('name2')).toBe('value2');
	expect(cookies.didParse).toBe(true);
	expect(cookies.get('name')).toBe('new-value');
	expect(cookies.getAll()).toEqual(
		new Map([
			['name', 'new-value'],
			['name2', 'value2'],
		]),
	);
});

test('does not overwrite already deleted cookie when parsing after delete', async () => {
	currentCookieHeader = 'name=value; name2=value2';
	const cookies = await serverCookiesGet();
	cookies.delete('name');
	expect(cookies.get('name')).toBe(undefined);
	expect(cookies.didParse).toBe(false);

	expect(cookies.get('name2')).toBe('value2');
	expect(cookies.didParse).toBe(true);
	expect(cookies.get('name')).toBe(undefined);
	expect(cookies.getAll()).toEqual(new Map([['name2', 'value2']]));
});
