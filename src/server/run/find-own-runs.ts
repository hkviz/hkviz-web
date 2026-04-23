import { query } from '@solidjs/router';
import * as v from 'valibot';
import { getUserOrNull } from '~/lib/auth/shared';
import { db } from '../db';
import { findRunsInternal } from './_find_runs_internal';
import { filterParamsBaseToInternalFilter, runFilterBaseSchema } from './find_runs_base';

const runFindOwnInputScheme = v.object({
	...runFilterBaseSchema.entries,
	archived: v.optional(v.boolean()),
});
export type RunOwnInput = v.InferOutput<typeof runFindOwnInputScheme>;

export const findOwnRuns = query(async (inputUnsafe: RunOwnInput) => {
	'use server';
	const input = v.parse(runFindOwnInputScheme, inputUnsafe);
	const user = await getUserOrNull();
	if (!user) {
		return [];
	}

	const internalFilter = filterParamsBaseToInternalFilter(input);
	internalFilter.archived = [input.archived ?? false];
	internalFilter.userId = user.id;

	return await findRunsInternal({
		db,
		currentUser: { id: user.id },
		filter: internalFilter,
		includeFiles: false,
	});
}, 'own-runs');
