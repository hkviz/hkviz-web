import { TRPCError } from '@trpc/server';
import { notFound } from 'next/navigation';
import { SingleRunClientPage } from '~/app/run/[id]/_page';
import { getServerAuthSession } from '~/server/auth';
import { apiFromServer } from '~/trpc/from-server';
import { ContentCenterWrapper, ContentWrapper } from '../../_components/content-wrapper';

export default async function SingleRunPage({ params }: { params: { id: string } }) {
    const session = await getServerAuthSession();

    // if (!session) {
    //     return <AuthNeeded />;
    // }

    try {
        const runData = await (await apiFromServer()).run.getMetadataById({ id: params.id });

        return (
            <ContentWrapper footerOutOfSight={true}>
                <SingleRunClientPage runData={runData} session={session} />
            </ContentWrapper>
        );
    } catch (e) {
        if (e instanceof TRPCError && e.code === 'NOT_FOUND') {
            notFound();
        }
        if (e instanceof TRPCError && e.code === 'FORBIDDEN') {
            return (
                <ContentCenterWrapper>
                    This run is set to private and can only be viewed by its owner.
                </ContentCenterWrapper>
            );
        }
        throw e;
    }
}
