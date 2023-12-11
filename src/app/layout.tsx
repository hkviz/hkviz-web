import '~/styles/globals.css';

import { cookies } from 'next/headers';

import { getServerAuthSession } from '~/server/auth';
import { cinzel, notoSans, cinzelDecorative } from '~/styles/fonts';
import { TRPCReactProvider } from '~/trpc/react';
import ClientContext from './_components/context';
import { MainNav } from './_components/main-nav';

export const metadata = {
    title: 'HKViz for Hollow Knight',
    description: 'Visual Analytics for HollowKnight',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerAuthSession();

    return (
        <html lang="en">
            <body className={`dark font-sans ${notoSans.variable} ${cinzel.variable} ${cinzelDecorative.variable}`}>
                <ClientContext>
                    <TRPCReactProvider cookies={cookies().toString()}>
                        <div className="flex min-h-[100dvh] flex-col">
                            <MainNav session={session} />
                            {children}
                        </div>
                    </TRPCReactProvider>
                </ClientContext>
            </body>
        </html>
    );
}
