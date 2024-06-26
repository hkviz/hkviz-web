import { isTagCode, tagGroupFromCode, tagOrGroupFromCode } from '~/lib/types/tags';
import { findRuns, type RunFilter } from '~/server/api/routers/run/runs-find';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';
import { ContentWrapper } from '../_components/content-wrapper';
import { RunCard } from '../_components/run-card';
import { RunFilters } from './_components';
import { runFilterParamsSchema } from './_params';

export function generateMetadata({ searchParams }: { searchParams: RunFilter }) {
    const filter = runFilterParamsSchema.parse(searchParams);
    const tagOrGroup = filter.tag ? tagOrGroupFromCode(filter.tag) : undefined;

    const title = tagOrGroup ? `${tagOrGroup.name} - Public gameplays - HKViz` : 'Public gameplays - HKViz';

    return {
        title,
        alternates: {
            canonical: '/run',
        },
    };
}

export default async function Runs({ searchParams }: { searchParams: RunFilter }) {
    const filter = runFilterParamsSchema.parse(searchParams);

    const session = await getServerAuthSession();
    const runs = await findRuns({
        db,
        filter: {
            visibility: ['public'],
            tag: filter.tag
                ? isTagCode(filter.tag)
                    ? [filter.tag]
                    : tagGroupFromCode(filter.tag).tags.map((it) => it.code)
                : undefined,
            sort: filter.sort ?? 'favorites',
            archived: [false],
        },
        currentUser: session?.user,
    });

    return (
        <ContentWrapper>
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                <div className="w-full max-w-[800px]">
                    <h1 className="mb-4 pl-2 text-center font-serif text-3xl font-semibold">Public gameplays</h1>

                    <RunFilters searchParams={filter} className="mb-4" />

                    {runs.length === 0 && <p className="text-center">No gameplays found</p>}
                    {runs.length > 0 && (
                        <ul className="flex flex-col">
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
