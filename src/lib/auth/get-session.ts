import { getSession } from '@auth/solid-start';
import { getWebRequest } from '@solidjs/start/http';
import { authOptions } from './auth-options';

export const getSessionOrNullInternal = async () => {
	'use server';
	const request = getWebRequest();
	return await getSession(request, authOptions);
};
