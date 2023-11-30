import { SingleRunClientPage } from '~/app/run/[id]/_page';
import { getServerAuthSession } from '~/server/auth';
import { api } from '~/trpc/server';
import { ContentWrapper } from '../../_components/content-wrapper';
import { apiFromServer } from '~/trpc/from-server';
import { notFound } from 'next/navigation';
import { TRPCError } from '@trpc/server';

export default async function SingleRunPage({ params }: { params: { id: string } }) {
    const session = await getServerAuthSession();
    console.log('xxyxiaksik', { params });

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
