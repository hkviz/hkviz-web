import { apiFromServer } from '~/trpc/from-server';
import { ContentCenterWrapper } from '../_components/content-wrapper';
import { RunCard } from '../_components/run-card';

export default async function Home() {
    const userRuns = await (await apiFromServer()).run.getUsersRuns({});

    return (
        <ContentCenterWrapper>
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                <div className="w-full max-w-[800px]">
                    {userRuns.length > 0 && (
                        <ul className="flex flex-col gap-2">
                            {userRuns.map((run) => (
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
