import * as v from 'valibot';
import { gameIdSchema } from '~/lib/types/game-ids';
import { RUN_SORT_DEFAULT, runSortSchema } from '~/lib/types/run-sort';
import { isTagCode, tagGroupFromCode, tagGroupSchema, tagSchema } from '~/lib/types/tags/tags';
import { RunFilter } from './_find_runs_internal';
import { FIND_RUN_DEFAULT_PAGE_SIZE, FIND_RUN_TERM_MAX_LENGTH } from './find-run-constants';

export const runFilterBaseSchema = v.object({
	tag: v.nullish(v.union([tagSchema, tagGroupSchema])),
	sort: v.nullish(runSortSchema),
	term: v.nullish(v.pipe(v.string(), v.maxLength(FIND_RUN_TERM_MAX_LENGTH))),
	game: v.nullish(gameIdSchema),
	limit: v.pipe(v.number(), v.minValue(1), v.maxValue(FIND_RUN_DEFAULT_PAGE_SIZE)),
	offset: v.nullish(v.pipe(v.number(), v.minValue(0))),
});

export type RunFilterBase = v.InferOutput<typeof runFilterBaseSchema>;

export const runFilterBaseNoPageSchema = v.omit(runFilterBaseSchema, ['limit', 'offset']);
export type RunFilterBaseNoPage = v.InferOutput<typeof runFilterBaseNoPageSchema>;

export function filterParamsBaseToInternalFilter(filter: RunFilterBase): RunFilter {
	return {
		tag: filter.tag
			? isTagCode(filter.tag)
				? [filter.tag]
				: tagGroupFromCode(filter.tag).tags.map((it) => it.code)
			: undefined,
		term: filter.term,
		sort: filter.sort ?? RUN_SORT_DEFAULT,
		games: filter.game ? [filter.game] : undefined,
		archived: [false],
		limit: filter.limit,
		offset: filter.offset,
	};
}

export function filterParamsAtPage<TFilter extends RunFilterBase>(
	filter: Omit<TFilter, 'offset' | 'limit'>,
	page: number,
	pageSize: number = FIND_RUN_DEFAULT_PAGE_SIZE,
) {
	return {
		...filter,
		offset: page * pageSize,
		limit: pageSize,
	};
}
