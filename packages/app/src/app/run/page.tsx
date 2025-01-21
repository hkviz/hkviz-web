import { tagOrGroupFromCode } from '~/lib/types/tags';
import { findRuns, type RunFilter } from '~/server/api/routers/run/runs-find';
import { ContentWrapper } from '../_components/content-wrapper';
import { RunCard } from '../_components/run-card';
import { RunFilters } from './_components';
import { runFilterParamsSchema } from './_params';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { HKVizText } from '../_components/hkviz-text';

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

    const runs = await findRuns({
        filter: {
            tag: filter.tag,
            sort: filter.sort ?? 'favorites',
        },
    });

    return (
        <ContentWrapper>
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                <div className="w-full max-w-[800px]">
                    <h1 className="mb-4 pl-2 text-center font-serif text-3xl font-semibold">Public gameplays</h1>

                    <Card className="mb-4">
                        <CardHeader>
                            <CardDescription>
                                The archived version of <HKVizText /> only shows the first 10 public gameplays. To use
                                this versions with other gameplays, first fisit the gameplay in the{' '}
                                <a className="underline" href="https://www.hkviz.org">
                                    latest version of <HKVizText />
                                </a>{' '}
                                and replace <code className="text-green-400 text-green-800">wwww.hkviz.org</code> in the
                                url <code className="text-green-400 text-green-800">v2.hkviz.org</code>.
                            </CardDescription>
                        </CardHeader>
                    </Card>

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
