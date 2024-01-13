import { TRPCError } from '@trpc/server';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SingleRunClientPage } from '~/app/run/[id]/_page';
import { getRunMeta } from '~/server/api/routers/run/get-run-meta';
import { getServerAuthSession } from '~/server/auth';
import { apiFromServer } from '~/trpc/from-server';
import { ContentCenterWrapper, ContentWrapper } from '../../_components/content-wrapper';

interface Params {
    id: string;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    return getRunMeta(params.id);
}

export default async function SingleRunPage({ params }: { params: Params }) {
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
