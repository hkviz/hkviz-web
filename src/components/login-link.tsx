import { A } from '@solidjs/router';
import { createLoginUrl } from '~/lib/auth/urls';
import { Button } from './ui/button';

export function LoginButton() {
	const loginUrl = createLoginUrl();
	return (
		<Button as={A} href={loginUrl()} target="_self">
			Login
		</Button>
	);
}
