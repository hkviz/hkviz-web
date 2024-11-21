import { action } from '@solidjs/router';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';
import { getUserOrThrow } from '~/lib/auth/shared';
import { type Tag, tagSchema } from '~/lib/types/tags';
import { db } from '../db';
import { runs } from '../db/schema';

const SetTagInput = v.object({
	id: v.pipe(v.string(), v.uuid()),
	code: tagSchema,
	hasTag: v.boolean(),
});
type SetTagInput = v.InferOutput<typeof SetTagInput>;

export async function setRunTag(unsaveInput: SetTagInput) {
	'use server';
	const input = v.parse(SetTagInput, unsaveInput);
	const user = await getUserOrThrow();

	const result = await db
		.update(runs)
		.set({ [`tag_${input.code}`]: input.hasTag })
		.where(and(eq(runs.id, input.id), eq(runs.userId, user.id)));

	if (result.rowsAffected !== 1) {
		throw new Error('Could not add tag');
	}
}

export const addTagAction = action(async (runId: string, code: Tag['code']) => {
	'use server';
	await setRunTag({ id: runId, code, hasTag: true });
}, 'add-run-tag');

export const removeTagAction = action(async (runId: string, code: Tag['code']) => {
	'use server';
	await setRunTag({ id: runId, code, hasTag: false });
}, 'remove-run-tag');
