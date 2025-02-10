import { action } from '@solidjs/router';
import { accountCancelRemovalRequestInternal } from '../account/deletion-internal';
import { getIngameAuthFlowState, getIngameAuthRedirect } from './ingameauth-flow-state';

export const ingameAuthCancelAccountDeletion = action(async () => {
	'use server';
	await accountCancelRemovalRequestInternal();

	const flow = await getIngameAuthFlowState();
	return await getIngameAuthRedirect(flow);
});
