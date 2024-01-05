import { raise } from '~/lib/utils';
import { assertIsResearcher } from '~/server/api/routers/lib/researcher';
import { findRuns } from '~/server/api/routers/run/runs-find';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';
import { AuthNeeded } from '../_components/auth-needed';
import { ContentCenterWrapper } from '../_components/content-wrapper';
import { RunCard } from '../_components/run-card';

export default async function Home() {
    const session = await getServerAuthSession();

    const userId = session?.user?.id;
    if (!userId) return <AuthNeeded />;

    await assertIsResearcher({
        db,
        userId,
        makeError: () => raise(new Error('403 Forbidden')),
    });

    const runs = await findRuns({
        db,
        currentUser: {
            id: userId,
            isResearcher: true,
        },
        filter: {},
    });

    return (
        <ContentCenterWrapper>
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                <div className="w-full max-w-[800px]">
                    {runs.length > 0 && (
                        <ul className="flex flex-col gap-2">
                            {runs.map((run) => (
                                <li key={run.id}>
                                    <RunCard run={run} key={run.id} />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </ContentCenterWrapper>
    );
}
