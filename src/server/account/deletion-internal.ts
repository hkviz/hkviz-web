import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { db } from '../db';
import { accountDeletionRequest } from '../db/schema';

export const accountCancelRemovalRequestById = async (idUnsafe: string) => {
	const id = v.parse(v.pipe(v.string(), v.uuid()), idUnsafe);
	const result = await db.delete(accountDeletionRequest).where(eq(accountDeletionRequest.id, id));
	if (result.rowsAffected === 0) {
		throw new Error('Account deletion request not found');
	}
	return true;
};
