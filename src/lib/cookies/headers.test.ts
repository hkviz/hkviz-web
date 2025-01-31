import { expect, test } from 'vitest';
import { combineHeaders } from './headers';

test('combines headers correctly', async () => {
	const result = combineHeaders(
		{ 'Content-Type': 'application/json' },
		[['Set-Cookie', 'name=value']],
		[['Set-Cookie', 'name2=value2']],
		{ Authorization: 'Bearer token' },
	);

	expect(result).toEqual([
		['Content-Type', 'application/json'],
		['Set-Cookie', 'name=value'],
		['Set-Cookie', 'name2=value2'],
		['Authorization', 'Bearer token'],
	]);
});

test('combines headers correctly with empty values', async () => {
	const result = combineHeaders(
		{ 'Content-Type': 'application/json' },
		[['Set-Cookie', 'name=value']],
		[['Set-Cookie', 'name2=value2']],
		undefined,
		{ Authorization: 'Bearer token' },
		null,
		{},
	);

	expect(result).toEqual([
		['Content-Type', 'application/json'],
		['Set-Cookie', 'name=value'],
		['Set-Cookie', 'name2=value2'],
		['Authorization', 'Bearer token'],
	]);
});

test('no headers gives undefined', async () => {
	const result = combineHeaders();
	expect(result).toBe(undefined);
});

test('single header returns input', async () => {
	const input = { 'Content-Type': 'application/json' };

	const result = combineHeaders(input);

	expect(result).toBe(input);
});
