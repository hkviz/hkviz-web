import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getServerAuthSession } from '~/server/auth';
import { apiFromServer } from '~/trpc/from-server';
import { ContentCenterWrapper } from './_components/content-wrapper';
import { RelativeDate } from './_components/date';
import { cinzelDecorative } from '~/styles/fonts';

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
                    <Card className="max-w-full">
                        <CardHeader>
                            <CardTitle>Your runs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="flex flex-row gap-2 overflow-x-auto">
                                {userRuns.map((run) => (
                                    <li key={run.id}>
                                        <Button
                                            variant="outline"
                                            asChild
                                            key={run.id}
                                            className="flex h-[unset] flex-col"
                                        >
                                            <Link href={`/run/${run.id}`}>
                                                {run.lastPlayedAt && (
                                                    <span className="block w-full truncate">
                                                        <span className="opacity-50">Last played: </span>
                                                        <span className="font-semibold">
                                                            <RelativeDate date={run.lastPlayedAt} />
                                                        </span>
                                                    </span>
                                                )}
                                                {run.startedAt && (
                                                    <span className="block w-full truncate">
                                                        <span className="opacity-50"> Started: </span>
                                                        <span className="font-semibold">
                                                            <RelativeDate date={run.startedAt} />
                                                        </span>
                                                    </span>
                                                )}
                                            </Link>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ContentCenterWrapper>
    );
}
