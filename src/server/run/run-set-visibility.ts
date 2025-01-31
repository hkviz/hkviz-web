import { action, json } from '@solidjs/router';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';
import { getUserOrThrow } from '~/lib/auth/shared';
import { visibilitySchema } from '~/lib/types/visibility';
import { db } from '../db';
import { runs } from '../db/schema';

const runSetVisibilitySchema = v.object({
	id: v.pipe(v.string(), v.uuid()),
	visibility: visibilitySchema,
});
type RunSetVisibility = v.InferOutput<typeof runSetVisibilitySchema>;

export async function runSetVisibility(unsaveInput: RunSetVisibility) {
	'use server';
	const user = await getUserOrThrow();
	const input = v.parse(runSetVisibilitySchema, unsaveInput);

	const userId = user.id;
	const result = await db
		.update(runs)
		.set({ visibility: input.visibility })
		.where(and(eq(runs.id, input.id), eq(runs.userId, userId)));

	if (result.rowsAffected !== 1) {
		throw new Error('Run not found');
	}

	return json({}, { revalidate: 'nothing' });
}

export const runSetVisibilityAction = action(runSetVisibility, 'run-set-visibility');
