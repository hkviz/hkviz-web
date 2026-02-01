import { Title } from '@solidjs/meta';
import { RouteDefinition } from '@solidjs/router';
import { Show } from 'solid-js';
import { AuthNeeded } from '~/components/auth-needed';
import { ContentCenterWrapper } from '~/components/content-wrapper';
import { Card } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { useSession } from '~/lib/auth/client';
import { accountGetScheduledForDeletion } from '~/server/account/deletion';
import SettingsAccountDeletionOption from './_deletion_option';
import { UserNameSettingsOption } from './_username_option';

export const route = {
	preload: () => {
		accountGetScheduledForDeletion();
	},
} satisfies RouteDefinition;

export default function SettingsPage() {
	const session = useSession();

	const currentName = () => session()?.user?.name ?? '';

	return (
		<Show when={session()} fallback={<AuthNeeded />}>
			<Title>Settings - HKViz</Title>
			<ContentCenterWrapper>
				<div class="max-w-[600px]">
					<h1 class="mb-4 pl-2 text-center font-serif text-4xl font-semibold">Settings</h1>
					<Card>
						<div class="p-6">
							<UserNameSettingsOption currentName={currentName()} />
							<Separator class="my-4" />
							<SettingsAccountDeletionOption />
						</div>
					</Card>
				</div>
			</ContentCenterWrapper>
		</Show>
	);
}
