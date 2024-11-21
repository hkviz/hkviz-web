import { Title } from '@solidjs/meta';
import { A } from '@solidjs/router';
import { Show } from 'solid-js';
import { AuthNeeded } from '~/components/auth-needed';
import { ContentCenterWrapper } from '~/components/content-wrapper';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { useSession } from '~/lib/auth/client';
import { UserNameSettingsOption } from './_username_option';

export default function SettingsPage() {
	const session = useSession();

	const currentName = () => session()?.user?.name ?? '';

	return (
		<Show when={session()} fallback={<AuthNeeded />}>
			<Title>Settings - HKViz</Title>
			<ContentCenterWrapper>
				<div class="max-w-[600px]">
					<h1 class="mb-4 pl-2 font-serif text-3xl font-semibold">Settings</h1>
					<Card>
						<div class="p-6">
							<UserNameSettingsOption currentName={currentName()} />
							<Separator class="my-4" />
							<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
								<div>
									<h3 class="text-lg font-semibold">Account deletion</h3>
									<p class="text-sm text-gray-500">Delete your account and your game play data.</p>
								</div>
								<Button variant="destructive" as={A} class="shrink-0" href="/settings/account-deletion">
									Delete account
								</Button>
							</div>
						</div>
					</Card>
				</div>
			</ContentCenterWrapper>
		</Show>
	);
}
