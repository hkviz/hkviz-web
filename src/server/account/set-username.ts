import { action } from '@solidjs/router';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { getUserOrThrow } from '~/lib/auth/shared';
import { db } from '../db';
import { users } from '../db/schema';

const setUsernameInputSchema = v.object({
	username: v.pipe(v.string(), v.maxLength(64)),
});

type SetUsernameInput = v.InferOutput<typeof setUsernameInputSchema>;

export async function accountSetUsername(unsafeInput: SetUsernameInput) {
	'use server';
	const user = await getUserOrThrow();
	const input = v.parse(setUsernameInputSchema, unsafeInput);

	const current = await db.query.users.findFirst({
		where: (users, { eq }) => eq(users.id, user.id),
		columns: {
			name: true,
			previousName: true,
		},
	});

	const result = await db
		.update(users)
		.set({ name: input.username, previousName: current?.previousName ?? current?.name })
		.where(eq(users.id, user.id));

	if (result.rowsAffected === 0) {
		throw new Error('Could not set name');
	}
}

export const accountSetUsernameAction = action(accountSetUsername, 'account-set-username');
