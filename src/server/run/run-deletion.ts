import { action } from '@solidjs/router';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';
import { getUserOrThrow } from '~/lib/auth/shared';
import { db } from '~/server/db';
import { runs } from '~/server/db/schema';
import { runDeleteInternal } from './run-deletion-internal';

const runDeleteInputSchema = v.object({ runId: v.pipe(v.string(), v.uuid()) });
type RunDeleteInput = v.InferOutput<typeof runDeleteInputSchema>;

export const runDelete = action(async (unsafeInput: RunDeleteInput) => {
	'use server';
	const user = await getUserOrThrow();
	const userId = user.id;
	const input = v.parse(runDeleteInputSchema, unsafeInput);
	runDeleteInternal({ runId: input.runId, userId });
});

const runArchiveInputSchema = v.object({ runId: v.pipe(v.string(), v.uuid()), archived: v.boolean() });
type RunArchiveInput = v.InferOutput<typeof runArchiveInputSchema>;

export const runArchive = action(async (unsafeInput: RunArchiveInput) => {
	'use server';
	const user = await getUserOrThrow();
	const userId = user.id;
	const input = v.parse(runArchiveInputSchema, unsafeInput);

	const result = await db
		.update(runs)
		.set({ archived: input.archived })
		.where(and(eq(runs.id, input.runId), eq(runs.userId, userId)));

	if (result.rowsAffected === 0) {
		throw new Error('Run not found while setting archived');
	}
});
