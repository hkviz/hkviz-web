import Link from 'next/link';

import { getServerAuthSession } from '~/server/auth';
import { ebGaramond } from '~/styles/fonts';
import { ContentCenterWrapper } from './_components/content-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiFromServer } from '~/trpc/from-server';
import { RelativeDate } from './_components/client-date';

export default async function Home() {
    const session = await getServerAuthSession();
    const userRuns = session?.user?.id
        ? await (await apiFromServer()).run.getUsersRuns({ userId: session.user.id ?? '' })
        : [];

    return (
        <ContentCenterWrapper>
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                <div className={`${ebGaramond.className} text-center`}>
                    <h1 className={`title-text-glow -mb-6 text-[5rem] font-semibold tracking-tight sm:text-[6rem]`}>
                        HKViz
                    </h1>
                    <h2 className="title-text-glow text-2xl sm:text-3xl">Visualizations for HollowKnight</h2>
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
                                                <span className="block w-full truncate">
                                                    <span className="opacity-50">Last played: </span>
                                                    <span className="font-semibold">
                                                        <RelativeDate date={run.lastPlayedAt} />
                                                    </span>
                                                </span>
                                                <span className="block w-full truncate">
                                                    <span className="opacity-50"> Started: </span>
                                                    <span className="font-semibold">
                                                        <RelativeDate date={run.startedAt} />
                                                    </span>
                                                </span>
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
