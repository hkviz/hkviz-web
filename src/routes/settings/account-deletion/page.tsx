import { ContentCenterWrapper } from '~/components/content-wrapper';
import { AccountDeletionForm } from './_components';
import { useSession } from '~/lib/auth/client';

export default async function Upload() {
	const session = useSession();

	const currentName = () => session()?.user?.name ?? '';

	return <Show when={session()} fallback={<AuthNeeded />}></Show>;

	const removalRequestId = await (await apiFromServer()).account.initiateAccountRemovalRequest();

	return (
		<ContentCenterWrapper>
			<div class="container flex flex-col items-center justify-center gap-4">
				{/* <h1 className="text-4xl font-extrabold tracking-tight">Upload a Hollow Knight run</h1> */}
				<AccountDeletionForm removalRequestId={removalRequestId} />
			</div>
		</ContentCenterWrapper>
	);
}
