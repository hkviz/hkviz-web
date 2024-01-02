import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getServerAuthSession } from '~/server/auth';
import { apiFromServer } from '~/trpc/from-server';
import { ContentCenterWrapper } from './_components/content-wrapper';
import { GradientSeperator } from './_components/gradient-seperator';
import { HKVizText } from './_components/hkviz-text';
import { RunCard } from './_components/run-card';

export default async function Home() {
    const session = await getServerAuthSession();
    const userRuns = session?.user?.id
        ? await (await apiFromServer()).run.getUsersRuns({ userId: session.user.id })
        : [];

    return (
        <ContentCenterWrapper>
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
                <div className={`max-w-[70ch] text-center`}>
                    <h1
                        className={`title-text-glow  -mb-6 font-serif text-[5rem] font-bold tracking-tight sm:text-[6rem]`}
                    >
                        HK<span className="font-serifDecorative">V</span>iz
                    </h1>
                    <h2 className="title-text-glow font-serif text-2xl sm:text-3xl">
                        Visual Analytics for HollowKnight
                    </h2>

                    <p className="pt-4">
                        With <HKVizText /> you can record gameplay analytics of your HollowKnight gameplays, and share
                        them with your others.
                    </p>

                    {userRuns.length == 0 && (
                        <div className="flex flex-row items-center justify-center pt-8 transition sm:gap-12">
                            <Button
                                asChild
                                className="rounded-3xl p-8 text-2xl font-semibold shadow-md hover:shadow-lg"
                            >
                                <Link href="/getting-started">Getting started</Link>
                            </Button>
                        </div>
                    )}
                </div>

                {userRuns.length > 0 && (
                    <>
                        <GradientSeperator />
                        <div className="w-full max-w-[800px]">
                            <h1 className="mb-4 pl-2 text-center font-serif text-3xl font-semibold">Your gameplays</h1>
                            <ul className="flex flex-col gap-2">
                                {userRuns.map((run) => (
                                    <li key={run.id}>
                                        <RunCard run={run} key={run.id} showUser={false} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </ContentCenterWrapper>
    );
}
