import { cache } from '@solidjs/router';
import { getUserOrNull } from '../auth/server';
import { db } from '../db';
import { findRunsInternal } from './_find_runs_internal';

export const findOwnRuns = cache(async () => {
	'use server';
	const user = await getUserOrNull();
	if (!user) {
		return [];
	}

	console.log('findOwnRuns', user.id);

	return await findRunsInternal({
		db,
		currentUser: { id: user.id },
		filter: { userId: user.id, archived: [false] },
		includeFiles: false,
	});
}, 'own-runs');
