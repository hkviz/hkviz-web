import { query } from '@solidjs/router';
import { getSessionOrNullInternal } from './get-session';

export const getSessionOrNull = query(async () => await getSessionOrNullInternal(), 'session');

export async function getUserOrNull() {
	return (await getSessionOrNull())?.user ?? null;
}

export async function getUserOrThrow() {
	const user = await getUserOrNull();
	if (!user) {
		throw new Error('User not found');
	}
	return user;
}
