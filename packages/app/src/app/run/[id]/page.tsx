import { type Metadata } from 'next';
import { HKVizText } from '~/app/_components/hkviz-text';
import { SingleRunClientPage } from '~/app/run/[id]/_page';
import { getRunMeta } from '~/server/api/routers/run/get-run-meta';
import { getRun } from '~/server/api/routers/run/run-get';
import { ContentCenterWrapper, ContentWrapper } from '../../_components/content-wrapper';

export const runtime = 'edge';

interface Params {
    id: string;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    return getRunMeta(params.id);
}

export default async function SingleRunPage({ params }: { params: Params }) {
    try {
        const runData = await getRun(params.id);

        return (
            <ContentWrapper footerOutOfSight={true}>
                <SingleRunClientPage runData={runData} />
            </ContentWrapper>
        );
    } catch (e) {
        return (
            <ContentCenterWrapper>
                <div className="text-center">
                    <h1 className="text-3xl font-semibold">Gameplay could not be loaded</h1>
                    <p className="mt-4">
                        This might be because it is private, or not accessible in the archived version of <HKVizText />.
                        You can try visiting the gameplay at the latest version of <HKVizText />:
                        <a href={'/run' + params.id}>https://hkviz.org/run/{params.id}</a>
                    </p>
                </div>
            </ContentCenterWrapper>
        );
    }
}
