import { redirect } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { accountCancelRemovalRequestById } from '~/server/account/deletion-internal';

export async function GET({ params }: APIEvent): Promise<Response> {
	try {
		await accountCancelRemovalRequestById(params.id);
		return redirect('/settings/account-deletion/cancel-success');
	} catch (error) {
		console.error('Error while canceling account deletion', params.id, error);
		return redirect('/settings/account-deletion/cancel-error');
	}
}
