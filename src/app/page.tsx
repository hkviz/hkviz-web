import Link from 'next/link';

import { getServerAuthSession } from '~/server/auth';
import { ebGaramond } from '~/styles/fonts';
import { ContentCenterWrapper } from './_components/content-wrapper';

export default async function Home() {
    const session = await getServerAuthSession();

    return (
        <ContentCenterWrapper>
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                <h1
                    className={`title-text-glow text-5xl font-extrabold tracking-tight sm:text-[5rem] ${ebGaramond.className}`}
                >
                    HKViz
                </h1>
                <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <p className="text-center text-2xl text-white">
                            {session && <span>Logged in as {session.user?.name}</span>}
                        </p>
                        <Link
                            href={session ? '/api/auth/signout' : '/api/auth/signin'}
                            className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                        >
                            {session ? 'Sign out' : 'Sign in'}
                        </Link>
                    </div>
                </div>
            </div>
        </ContentCenterWrapper>
    );
}
