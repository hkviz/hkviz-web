import { Title } from '@solidjs/meta';
import { useAction, useSubmission } from '@solidjs/router';
import { createSignal, Match, Switch } from 'solid-js';
import { ContentCenterWrapper } from '~/components/content-wrapper';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { HKVizText } from '~/lib/viz';
import { ingameAuthCancelAccountDeletion } from '~/server/ingameauth/cancel-account-deletion';
import { ingameAuthCancelLogin } from '~/server/ingameauth/cancel-login';

export default function IngameAuthCancelAccountDeletionPage() {
	const keepAccountMutation = useAction(ingameAuthCancelAccountDeletion);
	const cancelMutation = useAction(ingameAuthCancelLogin);
	const keepAccountSubmission = useSubmission(ingameAuthCancelAccountDeletion);
	const cancelSubmission = useSubmission(ingameAuthCancelLogin);

	const [keepSuccess, setKeepSuccess] = createSignal(false);
	const [cancelSuccess, setCancelSuccess] = createSignal(false);

	const handleKeepAccount = async () => {
		keepAccountSubmission.clear();
		cancelSubmission.clear();

		await keepAccountMutation();
		setKeepSuccess(true);
	};

	const handleCancel = async () => {
		keepAccountSubmission.clear();
		cancelSubmission.clear();

		await cancelMutation();
		setCancelSuccess(true);
	};

	const isMutating = () => keepAccountSubmission.pending || cancelSubmission.pending;

	return (
		<ContentCenterWrapper>
			<Title>Login - HKViz</Title>
			<Switch>
				<Match when={keepSuccess()}>
					<Card class="max-w-[500px]">
						<CardHeader>
							<CardTitle>Account deletion canceled</CardTitle>
							<CardDescription>You will be redirected</CardDescription>
						</CardHeader>
					</Card>
				</Match>
				<Match when={cancelSuccess()}>
					<Card class="max-w-[500px]">
						<CardHeader>
							<CardTitle>Login canceled</CardTitle>
							<CardDescription>You can close this page now</CardDescription>
						</CardHeader>
					</Card>
				</Match>
				<Match when={true}>
					<Card class="max-w-[500px] border-red-300 dark:border-red-800">
						<CardHeader>
							<CardTitle>Your account is marked for deletion?</CardTitle>
							<CardDescription>
								Login into the <HKVizText /> mod is not supported for soon to be deleted accounts.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{!!keepAccountSubmission.error && <p class="text-red-600">Could not cancel deletion</p>}
							{!!cancelSubmission.error && <p class="text-red-600">Could not cancel login</p>}
						</CardContent>
						<CardFooter class="flex justify-between gap-2">
							<Button class="grow" variant="outline" onClick={handleCancel} disabled={isMutating()}>
								Cancel
							</Button>
							<Button class="grow" onClick={handleKeepAccount} disabled={isMutating()}>
								Keep Account
							</Button>
						</CardFooter>
					</Card>
				</Match>
			</Switch>
		</ContentCenterWrapper>
	);
}
