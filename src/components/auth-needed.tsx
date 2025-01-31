import { ContentCenterWrapper } from './content-wrapper';
import { LoginButton } from './login-link';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

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
