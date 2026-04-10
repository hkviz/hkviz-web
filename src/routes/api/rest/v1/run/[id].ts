import type { APIEvent } from '@solidjs/start/server';
import { db } from '~/server/db';
import { findRunsInternal, RunFilter } from '~/server/run/_find_runs_internal';
import { RunDataV1 } from '../v1-api-models';
import { checkCompatApiKey } from './_check_key';
import { mapRunToV1 } from './_map_run';

export async function GET({ params, request }: APIEvent): Promise<RunDataV1> {
	checkCompatApiKey(request);

	const id = params.id;
	const isAnonymAccessKey = id.startsWith('a-');
	const filter: RunFilter = isAnonymAccessKey
		? { anonymAccessKey: id.slice(2), games: ['hollow'] }
		: {
				id: [id],
				visibility: ['public', 'unlisted'],
				games: ['hollow'],
			};

	const runs = await findRunsInternal({
		db,
		filter,
		includeFiles: true,
		skipVisibilityCheck: true,
		isAnonymAccess: isAnonymAccessKey,
	});
	const run = runs[0];
	if (!run) {
		throw new Error('Run not found');
	}
	return mapRunToV1(run);
}
