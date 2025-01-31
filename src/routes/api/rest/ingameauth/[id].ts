import type { APIEvent } from '@solidjs/start/server';
import { ingameAuthGetStatus } from '~/server/ingameauth/get-status';
import { ingameAuthLogout } from '~/server/ingameauth/logout';

export const GET = async ({ params }: APIEvent) => {
	return await ingameAuthGetStatus({ id: params.id });
};

export const DELETE = async ({ params }: APIEvent) => {
	return await ingameAuthLogout({ id: params.id });
};
