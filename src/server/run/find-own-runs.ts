import { query } from '@solidjs/router';
import { getUserOrNull } from '~/lib/auth/shared';
import { db } from '../db';
import { findRunsInternal } from './_find_runs_internal';
import * as v from 'valibot';

const runFindOwnInputScheme = v.object({
	archived: v.optional(v.boolean()),
});
type RunOwnInput = v.InferOutput<typeof runFindOwnInputScheme>;

export const findOwnRuns = query(async (inputUnsafe: RunOwnInput = {}) => {
	'use server';
	const input = v.parse(runFindOwnInputScheme, inputUnsafe);
	const user = await getUserOrNull();
	if (!user) {
		return [];
	}

	return await findRunsInternal({
		db,
		currentUser: { id: user.id },
		filter: { userId: user.id, archived: [input.archived ?? false] },
		includeFiles: false,
	});
}, 'own-runs');
