import { type Metadata } from 'next';
import { hkVizUrl } from '~/lib/url';
import { ContentCenterWrapper } from './_components/content-wrapper';
import { GradientSeparator } from './_components/gradient-separator';
import { HKVizText } from './_components/hkviz-text';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const runtime = 'edge';

export const metadata: Metadata = {
    alternates: {
        canonical: '/',
    },
};

export default function Home() {
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
                        Visual Analytics for Hollow Knight
                    </h2>
                    <p className="text-pretty pt-4">
                        With <HKVizText /> you can record gameplay analytics of your Hollow Knight gameplays, and share
                        them with others.
                    </p>
                </div>

                <GradientSeparator />

                <Card className="max-w-[76ch]">
                    <CardHeader>
                        <CardTitle className="font-serif text-3xl font-semibold">
                            You are using an older version of <HKVizText />
                        </CardTitle>
                        <CardDescription className="text-pretty pt-4">
                            The visualizations here were shown to our study participants. For the latest version, visit{' '}
                            <a href={hkVizUrl()} className="underline">
                                www.hkviz.org
                            </a>
                            . Features requiring authorization have been removed, but the visualizations remain
                            unchanged.
                        </CardDescription>
                        <CardDescription className="text-pretty pt-4">
                            To view a specific gameplay, open it in the{' '}
                            <a href={hkVizUrl()} className="underline">
                                current <HKVizText /> version{' '}
                            </a>
                            , then change <code className="text-green-800 dark:text-green-400">www.hkviz.org</code> to{' '}
                            <code className="text-green-800 dark:text-green-400">v2.hkviz.org</code> in the URL, e.g.,{' '}
                            <code className="text-green-800 dark:text-green-400">
                                https://v2.hkviz.org/run/{'<'}id{'>'}
                            </code>
                            .
                        </CardDescription>
                        <CardDescription className="text-pretty pt-4">
                            Note: This version does not support private gameplays — make sure they are public or
                            unlisted.
                        </CardDescription>
                    </CardHeader>
                </Card>

                <GradientSeparator />
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
