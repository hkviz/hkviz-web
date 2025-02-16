import { useUser } from '~/lib/auth/client';
import { ContentCenterWrapper } from './content-wrapper';
import { LoginButton } from './login-link';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { JSXElement, Show } from 'solid-js';

export function AuthNeeded() {
	return (
		<ContentCenterWrapper>
			<Card>
				<CardHeader>
					<CardTitle>Login required</CardTitle>
					<CardDescription>This page requires authentication.</CardDescription>
				</CardHeader>
				<CardFooter class="flex justify-end">
					<LoginButton />
				</CardFooter>
			</Card>
		</ContentCenterWrapper>
	);
}

export interface AuthNeededWrapperProps {
	children: JSXElement;
}

export function AuthNeededWrapper(props: AuthNeededWrapperProps) {
	const user = useUser();

	return (
		<Show when={user()?.id} fallback={<AuthNeeded />}>
			{props.children}
		</Show>
	);
}
