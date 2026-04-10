import type { APIEvent } from '@solidjs/start/server';
import * as v from 'valibot';
import { findPublicRuns } from '~/server/run/find-public-runs';
import { RunDataV1, runFilterV1Schema } from '../v1-api-models';
import { checkCompatApiKey } from './_check_key';
import { mapRunToV1 } from './_map_run';

export async function POST({ request }: APIEvent): Promise<RunDataV1[]> {
	checkCompatApiKey(request);
	const filterUnsafe = await request.json();
	const filter = v.parse(runFilterV1Schema, filterUnsafe);

	const runs = await findPublicRuns({
		userId: filter.userId,
		tag: filter.tag,
		sort: filter.sort === 'favorites' ? 'likes' : 'newest',
		games: ['hollow'],
		limit: 10,
	});
	return runs.map(mapRunToV1);
}
