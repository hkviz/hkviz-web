import type { APIEvent } from '@solidjs/start/server';
import * as v from 'valibot';
import { TagCode, TagGroupCode } from '~/lib/types/tags/tags';
import { findPublicRuns } from '~/server/run/find-public-runs';
import { RunDataV1, runFilterV1Schema } from '../v1-api-models';
import { checkCompatApiKey } from './_check_key';
import { mapRunToV1 } from './_map_run';

export async function POST({ request }: APIEvent): Promise<RunDataV1[]> {
	checkCompatApiKey(request);
	const filterUnsafe = await request.json();
	const filter = v.parse(runFilterV1Schema, filterUnsafe);

	let tag: TagCode | TagGroupCode | undefined = filter.tag as TagCode | TagGroupCode | undefined;
	if (filter.tag === 'speedrun') {
		tag = 'hollow_speedrun';
	}
	// change in future if needed
	// else if (filter.tag && filter.tag.startsWith('speedrun_')) {
	// 	tag = 'hollow_' + filter.tag;
	// }

	const runs = await findPublicRuns({
		userId: filter.userId,
		tag: tag,
		sort: filter.sort === 'favorites' ? 'likes' : 'newest',
		game: 'hollow',
		limit: 10,
	});
	return runs.map(mapRunToV1);
}
