import type { APIEvent } from '@solidjs/start/server';
import { raise } from '~/lib/parser';
import { db } from '~/server/db';
import { findRunsInternal } from '~/server/run/_find_runs_internal';
import { RunDataV1 } from '../v1-api-models';
import { checkCompatApiKey } from './_check_key';

export async function GET({ params, request }: APIEvent): Promise<RunDataV1> {
	checkCompatApiKey(request);

	const id = params.id;

	const runs = await findRunsInternal({
		db,
		filter: {
			id: [id],
			visibility: ['public', 'unlisted'],
		},
		includeFiles: true,
		skipVisibilityCheck: true,
	});
	const run = runs[0];

	return run ?? raise(new Error('Run not found'));
}
