import '~/styles/globals.css';

import { cookies } from 'next/headers';

import { type Metadata } from 'next';
import { getServerAuthSession } from '~/server/auth';
import { cinzel, cinzelDecorative, notoSans } from '~/styles/fonts';
import { TRPCReactProvider } from '~/trpc/react';
import ClientContext from './_components/context';
import { MainNav } from './_components/main-nav';
import { FaviconsHead } from './_favicons-head';

export const metadata: Metadata = {
    title: 'HKViz for Hollow Knight',
    description: 'Visual Analytics for HollowKnight',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerAuthSession();

    const useDarkTheme = cookies().get('theme')?.value !== 'light';

    return (
        <html lang="en">
            <head>
                <FaviconsHead />
            </head>
            <body
                className={`${useDarkTheme ? 'dark' : ''} font-sans ${notoSans.variable} ${cinzel.variable} ${
                    cinzelDecorative.variable
                }`}
            >
                <ClientContext>
                    <TRPCReactProvider cookies={cookies().toString()}>
                        <div className="flex min-h-[100dvh] flex-col">
                            <MainNav session={session} theme={useDarkTheme ? 'dark' : 'light'} />
                            {children}
                        </div>
                    </TRPCReactProvider>
                </ClientContext>
            </body>
        </html>
    );
}
