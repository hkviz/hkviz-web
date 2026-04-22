import { action } from '@solidjs/router';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';
import { getUserOrThrow } from '~/lib/auth/shared';
import { GameId } from '~/lib/types/game-ids';
import { getTagDBColumn } from '~/lib/types/tags/tag_db_column';
import { type Tag, tagCodeWithGameSchema } from '~/lib/types/tags/tags';
import { db } from '../db';
import { runs } from '../db/schema';

const SetTagInput = v.object({
	id: v.pipe(v.string(), v.uuid()),
	code: tagCodeWithGameSchema,
	hasTag: v.boolean(),
});
type SetTagInput = v.InferOutput<typeof SetTagInput>;

export async function setRunTag(unsaveInput: SetTagInput) {
	'use server';
	const input = v.parse(SetTagInput, unsaveInput);
	const user = await getUserOrThrow();

	const dbColumn = getTagDBColumn(input.code.code);

	const result = await db
		.update(runs)
		.set({ [dbColumn]: input.hasTag })
		.where(and(eq(runs.id, input.id), eq(runs.userId, user.id), eq(runs.game, input.code.game)));

	if (result.rowsAffected !== 1) {
		throw new Error('Could not add tag');
	}
}

export const addTagAction = action(async (runId: string, code: Tag['code'], game: GameId) => {
	'use server';
	await setRunTag({ id: runId, code: { code, game }, hasTag: true });
}, 'add-run-tag');

export const removeTagAction = action(async (runId: string, code: Tag['code'], game: GameId) => {
	'use server';
	await setRunTag({ id: runId, code: { code, game }, hasTag: false });
}, 'remove-run-tag');
