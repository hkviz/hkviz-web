import { findPlayerPublicRuns } from '~/server/api/routers/player/find-player-runs';
import { getPlayerMeta } from '~/server/api/routers/player/get-player-meta';
import { ContentCenterWrapper } from '../../_components/content-wrapper';
import { RunCard } from '../../_components/run-card';

export const runtime = 'edge';

interface Params {
    id: string;
}

export async function generateMetadata({ params }: { params: Params }) {
    return await getPlayerMeta(params.id);
}

export default async function PublicPlayerPage({ params }: { params: Params }) {
    const userRuns = await findPlayerPublicRuns(params.id);
    const userName = userRuns[0]?.user?.name ?? 'Unnamed player';

    return (
        <ContentCenterWrapper>
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                <div className="w-full max-w-[800px]">
                    {userRuns.length === 0 && (
                        <p className="text-center">This player does not exist or has no public runs</p>
                    )}
                    {userRuns.length > 0 && (
                        <>
                            <h1 className="mb-4 pl-2 text-center font-serif text-3xl font-semibold">
                                {userName}
                                {"'"}s gameplays
                            </h1>
                            <ul className="flex flex-col">
                                {userRuns.map((run) => (
                                    <li key={run.id}>
                                        <RunCard run={run} key={run.id} showUser={false} />
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </div>
        </ContentCenterWrapper>
    );
}
