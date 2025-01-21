import type { APIEvent } from '@solidjs/start/server';
import * as v from 'valibot';
import { findPublicRuns } from '~/server/run/find-public-runs';
import { RunDataV1, runFilterV1Schema } from '../v1-api-models';
import { checkCompatApiKey } from './_check_key';

export async function POST({ request }: APIEvent): Promise<RunDataV1[]> {
	checkCompatApiKey(request);
	const filterUnsafe = await request.json();
	const filter = v.parse(runFilterV1Schema, filterUnsafe);

	return await findPublicRuns({
		userId: filter.userId,
		tag: filter.tag,
		sort: filter.sort === 'favorites' ? 'likes' : 'newest',
		limit: 10,
	});
}
