import type { APIEvent } from '@solidjs/start/server';
import { runPartCreate } from '~/server/run/run-upload-part';

export const POST = async ({ request }: APIEvent) => {
	const body: unknown = await request.json();
	// will be parsed by valibot, so ok to pass any
	 
	return runPartCreate(body as any);
};
