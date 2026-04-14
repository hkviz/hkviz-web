import { Title } from '@solidjs/meta';
import { useAction, useSearchParams, useSubmission } from '@solidjs/router';
import { createSignal, Match, Show, Switch } from 'solid-js';
import * as v from 'valibot';
import { ContentCenterWrapper } from '~/components/content-wrapper';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { useUser } from '~/lib/auth/client';
import { gameIdSchemaHollowDefault, getGameName } from '~/lib/types/game-ids';
import { ingameAuthAllowLogin } from '~/server/ingameauth/allow-login';
import { ingameAuthCancelLogin } from '~/server/ingameauth/cancel-login';

export default function IngameAuthPage() {
	const [params] = useSearchParams();
	const game = () => v.parse(gameIdSchemaHollowDefault, params.game);

	const allowMutation = useAction(ingameAuthAllowLogin);
	const cancelMutation = useAction(ingameAuthCancelLogin);
	const allowSubmission = useSubmission(ingameAuthAllowLogin);
	const cancelSubmission = useSubmission(ingameAuthCancelLogin);

	const user = useUser();

	const [allowSuccess, setAllowSuccess] = createSignal(false);
	const [cancelSuccess, setCancelSuccess] = createSignal(false);

	const handleAllow = async () => {
		allowSubmission.clear();
		cancelSubmission.clear();

		await allowMutation();
		setAllowSuccess(true);
	};

	const handleCancel = async () => {
		allowSubmission.clear();
		cancelSubmission.clear();

		await cancelMutation();
		setCancelSuccess(true);
	};

	const isMutating = () => allowSubmission.pending || cancelSubmission.pending;

	return (
		<ContentCenterWrapper>
			<Title>Login - HKViz</Title>
			<Switch>
				<Match when={allowSuccess()}>
					<Card class="max-w-125">
						<CardHeader>
							<CardTitle>Login successful</CardTitle>
							<CardDescription>You can switch back to {getGameName(game())} now</CardDescription>
						</CardHeader>
					</Card>
				</Match>
				<Match when={cancelSuccess()}>
					<Card class="max-w-125">
						<CardHeader>
							<CardTitle>Login canceled</CardTitle>
							<CardDescription>You can close this page now</CardDescription>
						</CardHeader>
					</Card>
				</Match>
				<Match when={true}>
					<Card class="max-w-125">
						<CardHeader>
							<CardTitle>Allow this device to upload analytics data?</CardTitle>
							<CardDescription>
								Data will be uploaded to{' '}
								<Show when={user()} fallback={<span>your account</span>}>
									{(user) => <span>the account {user().name}</span>}
								</Show>
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Show when={allowSubmission.error != null}>
								<p class="text-red-600">Could not login</p>
							</Show>
							<Show when={cancelSubmission.error != null}>
								<p class="text-red-600">Could not cancel login</p>
							</Show>
						</CardContent>
						<CardFooter class="flex justify-between gap-2">
							<Button class="grow" variant="outline" onClick={handleCancel} disabled={isMutating()}>
								Cancel
							</Button>
							<Button class="grow" onClick={handleAllow} disabled={isMutating()}>
								Allow
							</Button>
						</CardFooter>
					</Card>
				</Match>
			</Switch>
		</ContentCenterWrapper>
	);
}
