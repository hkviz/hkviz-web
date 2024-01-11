import '~/styles/globals.css';

import { cookies } from 'next/headers';

import { Toaster } from '@/components/ui/toaster';
import { type Metadata } from 'next';
import { getServerAuthSession } from '~/server/auth';
import { cinzel, cinzelDecorative, notoSans } from '~/styles/fonts';
import { TRPCReactProvider } from '~/trpc/react';
import ClientContext from './_components/context';
import { Footer } from './_components/footer';
import { MainNav } from './_components/main-nav';
import { FaviconsHead } from './_favicons-head';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
    title: 'HKViz for Hollow Knight',
    description: 'Visual Analytics for HollowKnight',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerAuthSession();

    const isDarkTheme = cookies().get('theme')?.value !== 'light';
    const theme = isDarkTheme ? 'dark' : 'light';

    return (
        <html lang="en">
            <head>
                <FaviconsHead theme={theme} />
            </head>
            <body
                className={`${isDarkTheme ? 'dark' : ''} font-sans ${notoSans.variable} ${cinzel.variable} ${
                    cinzelDecorative.variable
                }`}
            >
                <ClientContext>
                    <TRPCReactProvider cookies={cookies().toString()}>
                        <div>
                            <MainNav session={session} theme={theme} />
                            {children}
                            <Footer />
                        </div>
                    </TRPCReactProvider>
                </ClientContext>
                <Toaster />
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}
