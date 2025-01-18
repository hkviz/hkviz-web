import { A, createAsync, useAction, useSubmission } from '@solidjs/router';
import { Match, Switch } from 'solid-js';
import { Button } from '~/components/ui/button';
import { accountCancelRemovalRequest, accountGetScheduledForDeletion } from '~/server/account/deletion';
import { Setting, SettingContent, SettingDescription, SettingTitle } from './_option';

export default function SettingsAccountDeletionOption() {
	const isScheduledForDeletion = createAsync(() => accountGetScheduledForDeletion());

	const cancelDeletionAction = useAction(accountCancelRemovalRequest);
	const cancelDeletionSubmission = useSubmission(accountCancelRemovalRequest);

	return (
		<Switch>
			<Match when={cancelDeletionSubmission.result}>
				<Setting>
					<SettingContent>
						<SettingTitle>Deletion canceled</SettingTitle>
						<SettingDescription>Welcome back! 🎉</SettingDescription>
					</SettingContent>
					<Button variant="destructive" as={A} class="shrink-0" href="/settings/account-deletion">
						Delete account
					</Button>
				</Setting>
			</Match>
			<Match when={isScheduledForDeletion()}>
				<Setting class="bg-red-200 p-3 dark:bg-red-950">
					<SettingContent>
						<SettingTitle>Your Account will Be Removed</SettingTitle>
						<SettingDescription class="text-inherit">
							Your account is scheduled for deletion.
						</SettingDescription>
					</SettingContent>
					<Button
						onClick={() => cancelDeletionAction()}
						class="shrink-0"
						disabled={cancelDeletionSubmission.pending}
					>
						Cancel Deletion
					</Button>
				</Setting>
			</Match>
			<Match when={true}>
				<Setting>
					<SettingContent>
						<SettingTitle>Account deletion</SettingTitle>
						<SettingDescription>Delete your account and your game play data.</SettingDescription>
					</SettingContent>
					<Button variant="destructive" as={A} class="shrink-0" href="/settings/account-deletion">
						Delete account
					</Button>
				</Setting>
			</Match>
		</Switch>
	);
}
