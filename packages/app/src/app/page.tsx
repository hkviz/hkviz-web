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
                            You are using a old version of <HKVizText />
                        </CardTitle>
                        <CardDescription className="text-pretty pt-4">
                            The visualizations of this version were presented to our user study participants. If you are
                            looking for the newest version visit{' '}
                            <a href={hkVizUrl()} className="underline">
                                www.hkviz.org
                            </a>
                        </CardDescription>

                        <CardDescription className="text-pretty pt-4">
                            From the original version, all features that require authorization have been removed.
                            However, the visualizations the participants explored have not been changed.
                        </CardDescription>

                        <CardDescription className="text-pretty pt-4">
                            To view a particular gameplay, the easiest way is to open it in the{' '}
                            <a href={hkVizUrl()} className="underline">
                                current <HKVizText /> version
                            </a>{' '}
                            and to replace <code className="text-green-800 dark:text-green-400">www.hkviz.org</code>{' '}
                            with <code className="text-green-800 dark:text-green-400">v2.hkviz.org</code> in the url. So
                            you full url should be something like{' '}
                            <code className="text-green-800 dark:text-green-400">
                                https://v2.hkviz.org/run/{'<'}id{'>'}
                            </code>
                            . This version of <HKVizText /> does not support viewing private gameplays, make sure they
                            are public or unlisted first.
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
