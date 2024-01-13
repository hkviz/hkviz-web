import { type Metadata } from 'next';
import { findRuns } from '~/server/api/routers/run/runs-find';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';
import { AuthNeeded } from '../_components/auth-needed';
import { ContentCenterWrapper } from '../_components/content-wrapper';
import { RunCard } from '../_components/run-card';

export const metadata: Metadata = {
    title: 'Archived gameplays - HKViz',
};

export default async function Archive() {
    const session = await getServerAuthSession();
    const userId = session?.user?.id;

    if (!userId) return <AuthNeeded />;

    const userRuns = userId
        ? await findRuns({
              db,
              filter: {
                  archived: [true],
                  userId: userId,
              },
              currentUser: {
                  id: userId,
              },
          })
        : [];

    return (
        <ContentCenterWrapper>
            <div className="w-full max-w-[800px]">
                <h1 className="mb-4 mt-4 pl-2 text-center font-serif text-3xl font-semibold">
                    Your archived gameplays
                </h1>
                <ul className="flex flex-col">
                    {userRuns.map((run) => (
                        <li key={run.id}>
                            <RunCard run={run} key={run.id} showUser={false} isOwnRun={true} />
                        </li>
                    ))}
                </ul>
                {userRuns.length == 0 && <span>You do not have any archived gameplays</span>}
            </div>
        </ContentCenterWrapper>
    );
}
