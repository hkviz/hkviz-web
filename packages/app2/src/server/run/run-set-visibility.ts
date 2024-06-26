import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';
import { visibilitySchema } from '~/lib/types/visibility';
import { getUserOrThrow } from '../auth';
import { db } from '../db';
import { runs } from '../db/schema';
import { action } from '@solidjs/router';

const RunSetVisibility = v.object({
    id: v.pipe(v.string(), v.uuid()),
    visibility: visibilitySchema,
});
type RunSetVisibility = v.InferOutput<typeof RunSetVisibility>;

export async function runSetVisibility(unsaveInput: RunSetVisibility) {
    'use server';
    const user = await getUserOrThrow();
    const input = v.parse(RunSetVisibility, unsaveInput);

    const userId = user.id;
    const result = await db
        .update(runs)
        .set({ visibility: input.visibility })
        .where(and(eq(runs.id, input.id), eq(runs.userId, userId)));

    if (result.rowsAffected !== 1) {
        throw new Error('Run not found');
    }
}

export const runSetVisibilityAction = action(async (input: RunSetVisibility) => {
    'use server';
    await runSetVisibility(input);
}, 'run-set-visibility');
