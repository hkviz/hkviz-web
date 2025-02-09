import { Title } from '@solidjs/meta';
import { A } from '@solidjs/router';
import { ContentCenterWrapper } from '~/components/content-wrapper';
import { Button } from '~/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { useUser } from '~/lib/auth/client';
import { getLoginUrl } from '~/lib/auth/urls';

export default function AccountDeletionPage() {
	const user = useUser();

	return (
		<ContentCenterWrapper>
			<Title>Account Deletion - HKViz</Title>
			<Card>
				<CardHeader>
					<CardTitle>Account Deletion Cancelled</CardTitle>
					<CardDescription>
						Nice to see you keep your account! Feel free to close this tab now.
						<br />
						<br />
						Here are a few things you can do now, if you like:
					</CardDescription>
				</CardHeader>
				<CardFooter class="flex flex-col justify-center gap-2">
					<Button as={A} href={user() ? '/' : getLoginUrl('/')}>
						View your gameplays
					</Button>
					<Button as={A} href="/run">
						Explore public gameplays
					</Button>
					<Button as={A} href="/guide/install">
						View mod install guide
					</Button>
				</CardFooter>
			</Card>
		</ContentCenterWrapper>
	);
}
