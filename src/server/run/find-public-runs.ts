import { query } from '@solidjs/router';
import * as v from 'valibot';
import { getUserOrNull } from '~/lib/auth/shared';
import { db } from '../db';
import { findRunsInternal } from './_find_runs_internal';
import { filterParamsBaseToInternalFilter, runFilterBaseSchema } from './find_runs_base';

export const runFilterParamsSchema = v.object({
	...runFilterBaseSchema.entries,
	userId: v.nullish(v.pipe(v.string(), v.uuid())),
});
export type RunFilterParams = v.InferOutput<typeof runFilterParamsSchema>;
export const runFilterParamsNoPageSchema = v.omit(runFilterParamsSchema, ['limit', 'offset']);

export const findPublicRuns = query(async (unsaveFilter: RunFilterParams) => {
	'use server';
	const input = v.parse(runFilterParamsSchema, unsaveFilter);

	const user = await getUserOrNull();

	const internalFilter = filterParamsBaseToInternalFilter(input);
	internalFilter.userId = input.userId ?? undefined;
	internalFilter.visibility = ['public'];

	return await findRunsInternal({
		db,
		filter: internalFilter,
		currentUser: user ?? undefined,
	});
}, 'public-runs');
