import type { APIEvent } from '@solidjs/start/server';
import { ingameAuthGetByUrlId } from '~/server/ingameauth/get-active-by-url-id-set-cookie';

export async function GET({ params }: APIEvent) {
	console.log('urkId', params.urlId);
	return await ingameAuthGetByUrlId({ urlId: params.urlId });
}
