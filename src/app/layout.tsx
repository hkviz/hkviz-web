import '~/styles/globals.css';

import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';

import { TRPCReactProvider } from '~/trpc/react';
import { MainNav } from './_components/main-nav';
import { getServerAuthSession } from '~/server/auth';
import ClientContext from './_components/context';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
});

export const metadata = {
    title: 'HKViz for Hollow Knight',
    description: 'A visualizer for Hollow Knight runs and general stats',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerAuthSession();

    return (
        <html lang="en">
            <body className={`dark font-sans ${inter.variable}`}>
                <ClientContext>
                    <TRPCReactProvider cookies={cookies().toString()}>
                        <div className="flex min-h-screen flex-col">
                            <MainNav session={session} />
                            {children}
                        </div>
                    </TRPCReactProvider>
                </ClientContext>
            </body>
        </html>
    );
}
