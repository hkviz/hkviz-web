import { TRPCError } from '@trpc/server';
import { notFound } from 'next/navigation';
import { SingleRunClientPage } from '~/app/run/[id]/_page';
import { getServerAuthSession } from '~/server/auth';
import { apiFromServer } from '~/trpc/from-server';
import { ContentWrapper } from '../../_components/content-wrapper';
import { AuthNeeded } from '~/app/_components/auth-needed';

export default async function SingleRunPage({ params }: { params: { id: string } }) {
    const session = await getServerAuthSession();

    if (!session) {
        return <AuthNeeded />;
    }

    try {
        const runData = await (await apiFromServer()).run.getMetadataById({ id: params.id });

        return (
            <ContentWrapper>
                <SingleRunClientPage runData={runData} session={session} />
            </ContentWrapper>
        );
    } catch (e) {
        if (e instanceof TRPCError && e.code === 'NOT_FOUND') {
            notFound();
        }
        throw e;
    }
}
