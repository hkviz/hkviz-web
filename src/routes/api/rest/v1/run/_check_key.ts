import { env } from '~/env';

export function checkCompatApiKey(request: Request) {
	const apiKey = request.headers.get('x-api-key');
	if (apiKey !== env.COMPAT_API_KEY) {
		throw new Error('Invalid API key');
	}
}
