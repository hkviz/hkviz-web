import { useAction, useSubmission } from '@solidjs/router';
import { createSignal } from 'solid-js';
import { TextField, TextFieldInput } from '~/components/ui/text-field';
import { showToast } from '~/components/ui/toast';
import { errorGetMessage } from '~/lib/error-get-message';
import { accountSetUsernameAction } from '~/server/account/set-username';

export function UserNameSettingsOption(props: { currentName: string }) {
	const [userName, setUsername] = createSignal(props.currentName);

	const accountSetUsername = useAction(accountSetUsernameAction);
	const accountSetUsernameSubmission = useSubmission(accountSetUsernameAction);

	async function handleUsernameChange(event: FocusEvent) {
		const eventName = (event.target as HTMLInputElement).value;
		if (userName() != eventName) {
			setUsername(eventName);
			try {
				await accountSetUsername({ username: eventName });
				showToast({ title: 'Successfully set username' });
			} catch (error) {
				showToast({ title: 'Failed to set username', description: errorGetMessage(error) });
			}
		}
	}

	return (
		<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
			<div>
				<h3 class="text-lg font-semibold">Player name</h3>
				<p class="text-sm text-gray-500">Choose the name, that is displayed next to your public gameplays.</p>
			</div>
			<TextField>
				<TextFieldInput
					type="text"
					disabled={accountSetUsernameSubmission.pending}
					value={userName()}
					onBlur={handleUsernameChange}
				/>
			</TextField>
		</div>
	);
}
