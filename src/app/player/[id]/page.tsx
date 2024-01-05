import { findRuns } from '~/server/api/routers/run/runs-find';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';
import { ContentCenterWrapper } from '../../_components/content-wrapper';
import { RunCard } from '../../_components/run-card';

export default async function Home({ params }: { params: { id: string } }) {
    const session = await getServerAuthSession();
    const userRuns = await findRuns({
        db,
        filter: {
            visibility: ['public'],
            userId: params.id,
        },
    });

    const userName = userRuns[0]?.user?.name ?? 'Unnamed user';
    const isOwnProfile = session?.user?.id === params.id;

    return (
        <ContentCenterWrapper>
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                <div className="w-full max-w-[800px]">
                    {userRuns.length === 0 && (
                        <p className="text-center">
                            {isOwnProfile
                                ? 'You have no gameplays in your Profile yet'
                                : 'This player does not exist or has no public runs'}
                        </p>
                    )}
                    {userRuns.length > 0 && (
                        <>
                            <h1 className="mb-4 pl-2 text-center font-serif text-3xl font-semibold">
                                {userName}
                                {"'"}s gameplays
                            </h1>
                            <ul className="flex flex-col gap-2">
                                {userRuns.map((run) => (
                                    <li key={run.id}>
                                        <RunCard run={run} key={run.id} showUser={false} isOwnRun={isOwnProfile} />
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
