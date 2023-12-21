import { getServerAuthSession } from '~/server/auth';
import { apiFromServer } from '~/trpc/from-server';
import { AuthNeeded } from '../_components/auth-needed';
import { ContentCenterWrapper } from '../_components/content-wrapper';
import { AccountDeletionForm } from './_components';

export default async function Upload() {
    const session = await getServerAuthSession();

    if (!session) {
        return <AuthNeeded />;
    }

    const removalRequestId = await (await apiFromServer()).account.initiateAccountRemovalRequest();

    return (
        <ContentCenterWrapper>
            <div className="container flex flex-col items-center justify-center gap-4">
                {/* <h1 className="text-4xl font-extrabold tracking-tight">Upload a HollowKnight run</h1> */}
                <AccountDeletionForm removalRequestId={removalRequestId} />
            </div>
        </ContentCenterWrapper>
    );
}
