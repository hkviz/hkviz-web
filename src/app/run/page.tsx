import { findRuns } from '~/server/api/routers/runs-find';
import { db } from '~/server/db';
import { ContentWrapper } from '../_components/content-wrapper';
import { RunCard } from '../_components/run-card';

export default async function Runs({ params }: { params: { id: string } }) {
    const runs = await findRuns({
        db,
        filter: {
            visibility: ['public'],
        },
    });

    return (
        <ContentWrapper>
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                <div className="w-full max-w-[800px]">
                    <h1 className="mb-4 pl-2 text-center font-serif text-3xl font-semibold">Public gameplays</h1>
                    {runs.length === 0 && <p className="text-center">No gameplays found</p>}
                    {runs.length > 0 && (
                        <ul className="flex flex-col gap-2">
                            {runs.map((run) => (
                                <li key={run.id}>
                                    <RunCard run={run} key={run.id} showUser={true} />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </ContentWrapper>
    );
}
