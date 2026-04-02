import { User as AuthUser } from '@auth/solid-start';
import { query } from '@solidjs/router';
import { getSessionOrNullInternal } from './get-session';

export const getSessionOrNull = query(async () => await getSessionOrNullInternal(), 'session');

export interface User extends AuthUser {
	id: string;
}

export async function getUserOrNull() {
	const session = await getSessionOrNull();
	const user = session?.user;
	if (!user) {
		return null;
	}
	if (typeof user.id !== 'string') {
		console.warn('User id is not a string', { id: user.id, name: user.name });
		return null;
	}
	return user as User;
}

export async function getUserOrThrow() {
	const user = await getUserOrNull();
	if (!user) {
		throw new Error('User not found');
	}
	return user;
}
