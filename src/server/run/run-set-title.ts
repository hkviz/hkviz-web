import { action } from '@solidjs/router';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';
import { getUserOrThrow } from '~/lib/auth/shared';
import { MAX_RUN_TITLE_LENGTH } from '~/lib/types/run-fields';
import { db } from '../db';
import { runs } from '../db/schema';

const runSetTitleSchema = v.object({
	id: v.pipe(v.string(), v.uuid()),
	title: v.pipe(v.string(), v.maxLength(MAX_RUN_TITLE_LENGTH)),
});
type RunSetTitle = v.InferOutput<typeof runSetTitleSchema>;

export async function runSetTitle(unsaveInput: RunSetTitle) {
	'use server';
	const user = await getUserOrThrow();
	const input = v.parse(runSetTitleSchema, unsaveInput);

	const userId = user.id;

	const result = await db
		.update(runs)
		.set({ title: input.title })
		.where(and(eq(runs.id, input.id), eq(runs.userId, userId)));

	if (result.rowsAffected !== 1) {
		throw new Error('Run not found');
	}
}

export const runSetTitleAction = action(runSetTitle, 'run-set-title');
