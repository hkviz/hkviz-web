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
