import { query } from '@solidjs/router';
import * as v from 'valibot';
import { db } from '../db';
import { findRunsInternal } from '../run/_find_runs_internal';

const playerFindPublicInputSchema = v.object({
	playerId: v.pipe(v.string(), v.uuid()),
});
type PlayerFindInput = v.InferOutput<typeof playerFindPublicInputSchema>;

export const findPublicPlayer = query(async (inputUnsafe: PlayerFindInput) => {
	'use server';
	const input = v.parse(playerFindPublicInputSchema, inputUnsafe);

	console.log('findPublicPlayer called with', input);

	const runs = await findRunsInternal({
		db,
		filter: {
			visibility: ['public'],
			userId: input.playerId,
			archived: [false],
			limit: 1,
		},
	});
	const player = runs.length > 0 ? runs[0].user : null;

	return player;
}, 'public-player');
