import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getServerAuthSession } from '~/server/auth';
import { apiFromServer } from '~/trpc/from-server';
import { ContentCenterWrapper } from './_components/content-wrapper';
import { RelativeDate } from './_components/date';
import { RunCard } from './_components/run-card';
import { Separator } from '@/components/ui/separator';

function GradientSeperator() {
    return <Separator className="my-4 bg-transparent bg-gradient-to-r from-transparent via-current to-transparent" />;
}

export default async function Home() {
    const session = await getServerAuthSession();
    const userRuns = session?.user?.id
        ? await (await apiFromServer()).run.getUsersRuns({ userId: session.user.id ?? '' })
        : [];

    return (
        <ContentCenterWrapper>
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                <div className={`text-center font-serif`}>
                    <h1 className={`title-text-glow -mb-6 text-[5rem] font-bold tracking-tight sm:text-[6rem]`}>
                        HK<span className="font-serifDecorative">V</span>iz
                    </h1>
                    <h2 className="title-text-glow text-2xl sm:text-3xl">Visual Analytics for HollowKnight</h2>
                </div>

                <GradientSeperator />

                {userRuns.length === 0 && (
                    <Card className="max-w-[30rem]">
                        <CardHeader>
                            <CardTitle>Getting started</CardTitle>
                        </CardHeader>
                        <CardContent>
                            To visualize and analyse your own gameplay, you can signup and use the HKViz mod to upload
                            your play data.
                            {!session && (
                                <Button asChild className="mt-4">
                                    <Link href="/api/auth/signin">Sign up</Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
                {userRuns.length > 0 && (
                    <div className="w-full max-w-[800px]">
                        <h1 className="mb-4 pl-2 text-center font-serif text-3xl font-semibold">Your gameplays</h1>
                        <ul className="flex flex-col gap-2 overflow-x-auto">
                            {userRuns.map((run) => (
                                <li key={run.id}>
                                    <RunCard run={run} key={run.id} />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </ContentCenterWrapper>
    );
}
