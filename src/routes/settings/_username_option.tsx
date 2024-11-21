import { createSignal } from 'solid-js';
import { TextField, TextFieldInput } from '~/components/ui/text-field';
import { showToast } from '~/components/ui/toast';

export function UserNameSettingsOption(props: { currentName: string }) {
	const [userName, setUsername] = createSignal(props.currentName);

	// todo
	// const setUsernameMutation = api.account.setUsername.useMutation({
	// 	onSuccess() {
	// 		showToast({ title: 'Successfully set username' });
	// 		router.refresh();
	// 	},
	// });

	function handleUsernameChange(event: FocusEvent) {
		const eventName = (event.target as HTMLInputElement).value;
		if (userName() != eventName) {
			setUsername(eventName);
			// setUsernameMutation.mutate({ username: eventName });
		}
	}

	return (
		<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
			<div>
				<h3 class="text-lg font-semibold">Player name</h3>
				<p class="text-sm text-gray-500">Choose the name, that is displayed next to your public gameplays.</p>
			</div>
			<TextField>
				<TextFieldInput type="text" value={userName()} onBlur={handleUsernameChange} />
			</TextField>
		</div>
	);
}
