import { action, query } from '@solidjs/router';
import { and, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import * as v from 'valibot';
import { getUserOrThrow } from '~/lib/auth/shared';
import { db } from '../db';
import { accountDeletionRequest } from '../db/schema';
import { sendMailToSupport } from '../mails';

export const accountGetScheduledForDeletion = query(async () => {
	'use server';
	const user = await getUserOrThrow();

	const request = await db.query.accountDeletionRequest.findFirst({
		where: (request, { eq, and }) => and(eq(request.userId, user.id), eq(request.formAccepted, true)),
		columns: {
			id: true,
		},
	});

	return !!request;
}, 'account-get-scheduled-for-deletion');

export type AccountInitiateRemovalResult = { existing: true } | { existing: false; id: string };

export const accountInitiateRemovalRequest = query(async (): Promise<AccountInitiateRemovalResult> => {
	'use server';
	const user = await getUserOrThrow();

	// delete unconfirmed previous
	await db
		.delete(accountDeletionRequest)
		.where(and(eq(accountDeletionRequest.userId, user.id), eq(accountDeletionRequest.formAccepted, false)));

	// when previous confirmed exists return existing
	const existing = await db.query.accountDeletionRequest.findFirst({
		where: (request, { eq, and }) => and(eq(request.userId, user.id), eq(request.formAccepted, true)),
		columns: {
			id: true,
		},
	});

	if (existing) {
		return {
			existing: true,
		};
	}

	// when no previous confirmed exists create new
	const id = uuidv4();

	await db.insert(accountDeletionRequest).values({
		id,
		userId: user.id,
		createdAt: new Date(),
	});

	return {
		existing: false,
		id,
	};
}, 'account-initiate-removal-request');

export const accountCancelRemovalRequest = action(async () => {
	'use server';
	const user = await getUserOrThrow();

	const result = await db.delete(accountDeletionRequest).where(eq(accountDeletionRequest.userId, user.id));

	if (result.rowsAffected === 0) {
		// no need to throw
		console.error('Account deletion request not found', user.id);
	}
	return true;
});

export const accountAcceptRemovalRequestInputSchema = v.object({
	id: v.pipe(v.string(), v.uuid()),
});
export type AccountAcceptRemovalRequestInput = v.InferOutput<typeof accountAcceptRemovalRequestInputSchema>;

export const accountAcceptRemovalRequest = action(async (unsafeInput: AccountAcceptRemovalRequestInput) => {
	'use server';
	const input = v.parse(accountAcceptRemovalRequestInputSchema, unsafeInput);
	const user = await getUserOrThrow();

	const result = await db
		.update(accountDeletionRequest)
		.set({ formAccepted: true })
		.where(and(eq(accountDeletionRequest.id, input.id), eq(accountDeletionRequest.userId, user.id)));

	if (result.rowsAffected === 0) {
		throw new Error('Account deletion failed. Please contact support: support@hkviz.org');
	}

	await sendMailToSupport({
		subject: 'Deletion request',
		text: `Deletion request form user ${user.id} accepted. Please delete all data of this user.`,
		html: `Deletion request form user <b>${user.id}</b> accepted. Please delete all data of this user.`,
	});
	return true;
});
