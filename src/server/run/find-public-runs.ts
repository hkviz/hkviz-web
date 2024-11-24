import { cache } from '@solidjs/router';
import * as v from 'valibot';
import { getUserOrNull } from '~/lib/auth/shared';
import { runSortSchema } from '~/lib/types/run-sort';
import { isTagCode, tagGroupFromCode, tagGroupSchema, tagSchema } from '~/lib/types/tags';
import { db } from '../db';
import { findRunsInternal } from './_find_runs_internal';

export const RunFilterParamsSchema = v.object({
	tag: v.optional(v.union([tagSchema, tagGroupSchema])),
	sort: v.optional(runSortSchema),
	userId: v.optional(v.pipe(v.string(), v.uuid())),
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
			userId: filter.userId,
			archived: [false],
		},
		currentUser: user ?? undefined,
	});
}, 'public-runs');
