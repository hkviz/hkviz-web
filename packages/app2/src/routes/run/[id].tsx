import { createRunFileLoader } from '@hkviz/viz';
import { GameplayDashboard } from '@hkviz/viz-ui';
import { RouteSectionProps, createAsync, useParams } from '@solidjs/router';
import { Show, Suspense, createMemo } from 'solid-js';
import { ContentWrapper } from '~/components/content-wrapper';
import { RunCard } from '~/components/run-card';
import { getRun } from '~/server/run/run-get';
import { getRunPageTitle } from './_metadata';

interface Params {
    id: string;
}

// TODO
// export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
//     const session = await getServerAuthSession();
//     return getRunMeta(params.id, session?.user?.id ?? null);
// }

export default function SingleRunPage({ params }: RouteSectionProps) {
    const id = () => params.id;

    const runData = createAsync(() => getRun(id()));

    const loader = createMemo(() => {
        const run = runData();
        if (!run) return null;
        return createRunFileLoader(run.files);
    });

    return (
        <ContentWrapper footerOutOfSight={true}>
            <Show when={runData()}>
                {(runData) => (
                    <>
                        <title>{getRunPageTitle(runData())}</title>
                        <GameplayDashboard
                            startDate={runData().startedAt}
                            fileInfos={runData().files}
                            runFileLoader={loader()!}
                            gameplayCard={<RunCard run={runData()} showUser={true} />}
                        />
                    </>
                )}
            </Show>
        </ContentWrapper>
    );
}
