import { query } from '@solidjs/router';
import * as v from 'valibot';
import { getUserOrNull } from '~/lib/auth/shared';
import { RUN_SORT_DEFAULT, runSortSchema } from '~/lib/types/run-sort';
import { isTagCode, tagGroupFromCode, tagGroupSchema, tagSchema } from '~/lib/types/tags';
import { db } from '../db';
import { findRunsInternal } from './_find_runs_internal';

export const RunFilterParamsSchema = v.object({
	tag: v.nullish(v.union([tagSchema, tagGroupSchema])),
	sort: v.nullish(runSortSchema),
	userId: v.nullish(v.pipe(v.string(), v.uuid())),
	term: v.nullish(v.string()),
	limit: v.nullish(v.number()),
});
export type RunFilterParams = v.InferOutput<typeof RunFilterParamsSchema>;

export const findPublicRuns = query(async (unsaveFilter: RunFilterParams) => {
	'use server';
	const filter = v.parse(RunFilterParamsSchema, unsaveFilter);

	const user = await getUserOrNull();

	console.log(filter);

	return await findRunsInternal({
		db,
		filter: {
			visibility: ['public'],
			tag: filter.tag
				? isTagCode(filter.tag)
					? [filter.tag]
					: tagGroupFromCode(filter.tag).tags.map((it) => it.code)
				: undefined,
			term: filter.term,
			sort: filter.sort ?? RUN_SORT_DEFAULT,
			userId: filter.userId,
			archived: [false],
			limit: filter.limit,
		},
		currentUser: user ?? undefined,
	});
}, 'public-runs');
