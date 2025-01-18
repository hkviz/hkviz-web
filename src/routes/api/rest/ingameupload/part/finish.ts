import type { APIEvent } from '@solidjs/start/server';
import { runPartMarkFinished } from '~/server/run/run-upload-part';

export const POST = async ({ request }: APIEvent) => {
	const body: unknown = await request.json();
	// will be parsed by valibot, so ok to pass any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return await runPartMarkFinished(body as any);
};
