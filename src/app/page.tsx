import { Button } from '@/components/ui/button';
import { type Metadata } from 'next';
import Link from 'next/link';
import { findRuns } from '~/server/api/routers/run/runs-find';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';
import { ContentCenterWrapper } from './_components/content-wrapper';
import { GradientSeperator } from './_components/gradient-seperator';
import { HKVizText } from './_components/hkviz-text';
import { OwnRuns } from './_page_own_runs';

export const metadata: Metadata = {
    alternates: {
        canonical: '/',
    },
};

export default async function Home() {
    const session = await getServerAuthSession();
    const userId = session?.user?.id;
    const userRuns = userId
        ? await findRuns({
              db,
              filter: {
                  archived: [false],
                  userId: userId,
              },
              currentUser: {
                  id: userId,
              },
          })
        : [];

    return (
        <ContentCenterWrapper>
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
                <div className={`max-w-[70ch] text-center`}>
                    <h1
                        className={`title-text-glow  -mb-6 font-serif text-[5rem] font-bold tracking-tight sm:text-[6rem]`}
                    >
                        <HKVizText />
                    </h1>
                    <h2 className="title-text-glow font-serif text-2xl sm:text-3xl">
                        Visual Analytics for HollowKnight
                    </h2>
                    <p className="text-pretty pt-4">
                        With <HKVizText /> you can record gameplay analytics of your HollowKnight gameplays, and share
                        them with others.
                    </p>

                    {userRuns.length == 0 && (
                        <div className="flex flex-row items-center justify-center py-8 transition sm:gap-12">
                            <Button
                                asChild
                                className="rounded-3xl p-8 text-2xl font-semibold shadow-md hover:shadow-lg"
                            >
                                <Link href="/getting-started">Record gameplay analytics</Link>
                            </Button>
                        </div>
                    )}
                </div>

                {userRuns.length > 0 && (
                    <>
                        <GradientSeperator />
                        <OwnRuns runs={userRuns} />
                    </>
                )}

                <GradientSeperator />
                <div className={`max-w-[70ch] text-center`}>
                    <p className="text-pretty">
                        <HKVizText /> is developed to allow research on visual analytics and data visualization in
                        Metroidvania games and is not affiliated with{' '}
                        <a href="https://www.teamcherry.com.au/" target="_blank" className="hover:underline">
                            Team Cherry
                        </a>{' '}
                        the creators of{' '}
                        <a href="https://www.hollowknight.com/" target="_blank" className="hover:underline">
                            Hollow Knight
                        </a>
                    </p>
                </div>
            </div>
        </ContentCenterWrapper>
    );
}
