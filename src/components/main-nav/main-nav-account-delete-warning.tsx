import { createAsync, useAction, useSubmission } from '@solidjs/router';
import { createSignal, Show, Suspense } from 'solid-js';
import { accountCancelRemovalRequest, accountGetScheduledForDeletion } from '~/server/account/deletion';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export function MainNavAccountDeletionWarning() {
	const accountWillBeDeleted = createAsync(async () => !!(await accountGetScheduledForDeletion()));

	const cancelDeletionAction = useAction(accountCancelRemovalRequest);
	const cancelDeletionSubmission = useSubmission(accountCancelRemovalRequest);

	const [showCanceled, setShowCanceled] = createSignal(false);
	let showCanceledTimeout: number | undefined;

	async function cancelDelete() {
		await cancelDeletionAction();
		setShowCanceled(true);
		if (showCanceledTimeout) clearTimeout(showCanceledTimeout);
		showCanceledTimeout = setTimeout(() => setShowCanceled(false), 5000) as unknown as number;
	}

	return (
		<Suspense fallback={<></>}>
			<Show when={accountWillBeDeleted()}>
				<Card class="bg-red-100 p-2 text-red-800 dark:bg-red-900 dark:text-red-100">
					<span class="px-2">Your account will be deleted soon</span>
					<Button variant="destructive" onClick={cancelDelete} disabled={cancelDeletionSubmission.pending}>
						Keep account
					</Button>
				</Card>
			</Show>
			<Show when={!accountWillBeDeleted() && showCanceled()}>
				<Card class="bg-green-100 p-2 text-green-800 fade-out-100 dark:bg-green-900 dark:text-green-100">
					Deletion canceled successfully
				</Card>
			</Show>
		</Suspense>
	);
}
