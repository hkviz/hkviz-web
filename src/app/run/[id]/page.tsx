import { SingleRunClientPage } from '~/app/_components/single-run-client-page';
import { getServerAuthSession } from '~/server/auth';
import { api } from '~/trpc/server';
import { ContentWrapper } from '../../_components/content-wrapper';
import { apiFromServer } from '~/trpc/from-server';

export default async function SingleRunPage({ params }: { params: { id: string } }) {
    const session = await getServerAuthSession();
    console.log('xxyxiaksik', { params });

    const runData = await (await apiFromServer()).run.getMetadataById({ id: params.id });

    return (
        <ContentWrapper>
            <SingleRunClientPage runData={runData} session={session} />
        </ContentWrapper>
    );
}
