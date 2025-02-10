import { Title } from '@solidjs/meta';
import { A, createAsync, RouteDefinition, useAction, useSubmission } from '@solidjs/router';
import { Match, Switch, Show } from 'solid-js';
import { AuthNeeded } from '~/components/auth-needed';
import { ContentCenterWrapper } from '~/components/content-wrapper';
import { MailLink } from '~/components/mail-link';
import { Button } from '~/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { useSession } from '~/lib/auth/client';
import { createLogoutUrl } from '~/lib/auth/urls';
import {
	accountAcceptRemovalRequest,
	accountCancelRemovalRequest,
	accountInitiateRemovalRequest,
} from '~/server/account/deletion';

export const route = {
	load() {
		void accountInitiateRemovalRequest();
	},
} satisfies RouteDefinition;

export default function AccountDeletionPage() {
	const session = useSession();

	const deletionRequest = createAsync(() => accountInitiateRemovalRequest());

	const cancelAction = useAction(accountCancelRemovalRequest);
	const cancelSubmission = useSubmission(accountCancelRemovalRequest);

	const confirmAction = useAction(accountAcceptRemovalRequest);
	const confirmSubmission = useSubmission(accountAcceptRemovalRequest);

	const logoutUrl = createLogoutUrl();

	const isMutating = () => confirmSubmission.pending || cancelSubmission.pending;

	function handleCancel() {
		confirmSubmission.clear();
		cancelAction();
	}

	function handleConfirm() {
		const request = deletionRequest();
		if (request && !request.existing) {
			cancelSubmission.clear();
			confirmAction({ id: request.id });
		}
	}

	return (
		<Show when={session()} fallback={<AuthNeeded />}>
			<ContentCenterWrapper>
				<Title>Account Deletion - HKViz</Title>
				<Switch>
					{/* Cancel success */}
					<Match when={cancelSubmission.result}>
						<Card>
							<CardHeader>
								<CardTitle>Account Deletion Cancelled</CardTitle>
							</CardHeader>
							<CardFooter class="flex justify-end">
								<Button as={A} href="/settings">
									Back to Settings
								</Button>
							</CardFooter>
						</Card>
					</Match>
					{/* Deletion success */}
					<Match when={confirmSubmission.result || deletionRequest()?.existing}>
						<Card>
							<CardHeader>
								<CardTitle>Account Deletion Confirmed</CardTitle>
								<CardDescription>
									Account deletion confirmed. Your account and all associated data will be deleted
									within a month.
								</CardDescription>
							</CardHeader>
							<CardFooter class="flex justify-end gap-1">
								<Button onClick={handleCancel} variant="outline">
									Undo Deletion
								</Button>
								<Button as={A} href={logoutUrl()} target="_self">
									Sign Out
								</Button>
							</CardFooter>
						</Card>
					</Match>
					{/* Error somewhere */}
					<Match when={confirmSubmission.error || cancelSubmission.error}>
						<Card>
							<CardHeader>
								<CardTitle>Something went wrong. Sorry!</CardTitle>
								<CardDescription>
									Please contact our support via <MailLink /> for assistance if required.
								</CardDescription>
							</CardHeader>
						</Card>
					</Match>
					{/* Show form */}
					<Match when={true}>
						<Card class="w-[600px] max-w-[calc(100%-2rem)]">
							<CardHeader>
								<CardTitle>Delete your account</CardTitle>
								<CardDescription>
									Mark your account for deletion. All your data associated with your account will be
									deleted within 30 days.
								</CardDescription>
							</CardHeader>
							<CardFooter class="flex justify-end gap-1">
								<Button disabled={isMutating()} onClick={handleCancel} variant="outline">
									Cancel
								</Button>
								<Button disabled={isMutating()} onClick={handleConfirm} variant="destructive">
									Delete account
								</Button>
							</CardFooter>
						</Card>
					</Match>
				</Switch>
			</ContentCenterWrapper>
		</Show>
	);
}
