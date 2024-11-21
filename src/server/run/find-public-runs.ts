import { cache } from '@solidjs/router';
import * as v from 'valibot';
import { runSortSchema } from '~/lib/types/run-sort';
import { isTagCode, tagGroupFromCode, tagGroupSchema, tagSchema } from '~/lib/types/tags';
import { getUserOrNull } from '../auth/server';
import { db } from '../db';
import { findRunsInternal } from './_find_runs_internal';

export const RunFilterParamsSchema = v.object({
	tag: v.optional(v.union([tagSchema, tagGroupSchema])),
	sort: v.optional(runSortSchema),
});
export type RunFilterParams = v.InferOutput<typeof RunFilterParamsSchema>;

export const findPublicRuns = cache(async (unsaveFilter: RunFilterParams) => {
	'use server';
	const filter = v.parse(RunFilterParamsSchema, unsaveFilter);

	const user = await getUserOrNull();

	return await findRunsInternal({
		db,
		filter: {
			visibility: ['public'],
			tag: filter.tag
				? isTagCode(filter.tag)
					? [filter.tag]
					: tagGroupFromCode(filter.tag).tags.map((it) => it.code)
				: undefined,
			sort: filter.sort ?? 'favorites',
			archived: [false],
		},
		currentUser: user ?? undefined,
	});
}, 'public-runs');
