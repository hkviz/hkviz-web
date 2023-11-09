import { SingleRunClientPage } from '~/app/_components/single-run-client-page';
import { getServerAuthSession } from '~/server/auth';
import { api } from '~/trpc/server';
import { ContentWrapper } from '../../_components/content-wrapper';

export default async function SingleRunPage({ params }: { params: { id: string } }) {
    // const hello = await api.post.hello.query({ text: "from tRPC" });
    const session = await getServerAuthSession();
    console.log('xxyxiaksik', { params });

    const runData = await api.run.getMetadataById.query({ id: params.id });

    return (
        <ContentWrapper>
            <SingleRunClientPage runData={runData} session={session} />
        </ContentWrapper>
    );
}
