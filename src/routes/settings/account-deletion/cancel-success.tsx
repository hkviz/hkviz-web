import { Title } from '@solidjs/meta';
import { ContentCenterWrapper } from '~/components/content-wrapper';
import { Button } from '~/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { useUser } from '~/lib/auth/client';
import { getLoginUrl } from '~/lib/auth/urls';
import { AA } from '~/lib/routing/AA';

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
					<Button as={AA} href={user() ? '/' : getLoginUrl('/')}>
						View Your Gameplays
					</Button>
					<Button as={AA} href="/run">
						Explore Public Gameplays
					</Button>
					<Button as={AA} href="/guide/install">
						View Gameplay Recording Guide
					</Button>
				</CardFooter>
			</Card>
		</ContentCenterWrapper>
	);
}
