import type { APIEvent } from '@solidjs/start/server';
import { ingameAuthInit } from '~/server/ingameauth/init';

export async function POST({ request }: APIEvent) {
	const body: unknown = await request.json();
	// will be validated by valibot, so ok to pass any
	 
	return await ingameAuthInit(body as any);
}
