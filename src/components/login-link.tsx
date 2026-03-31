import { createLoginUrl } from '~/lib/auth/urls';
import { AA } from '~/lib/routing/AA';
import { Button } from './ui/button';

export function LoginButton() {
	const loginUrl = createLoginUrl();
	return (
		<Button as={AA} href={loginUrl()} target="_self">
			Login
		</Button>
	);
}
