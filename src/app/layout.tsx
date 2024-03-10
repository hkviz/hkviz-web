import '~/styles/globals.css';

import { cookies, headers } from 'next/headers';

import { Toaster } from '@/components/ui/toaster';
import { type Metadata } from 'next';
import { getServerAuthSession } from '~/server/auth';
import { cinzel, cinzelDecorative, ebGaramond, notoSans } from '~/styles/fonts';
import { TRPCReactProvider } from '~/trpc/react';
import ClientContext from './_components/context';
import { Footer } from './_components/footer';
import { MainNav } from './_components/main-nav';
import { FaviconsHead } from './_favicons-head';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { permanentRedirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'HKViz for Hollow Knight',
    description: 'Visual Analytics for Hollow Knight',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
    metadataBase: new URL('https://www.hkviz.org'),
    openGraph: {
        images: '/og-image.png',
        siteName: 'HKViz',
    },
};

const oldUrls = [
    // production
    'https://hkviz.olii.dev',
    // for local testing uncomment
    // 'http://localhost:3000'
];

const jsonLd = {
    __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        url: 'https://www.hkviz.org',
        name: 'HKViz',
    }),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerAuthSession();

    const isDarkTheme = cookies().get('theme')?.value !== 'light';
    const theme = isDarkTheme ? 'dark' : 'light';

    // only redirects users which are not logged in for now, since otherwise the session is lost
    const url = headers().get('x-url') ?? '';
    for (const oldUrl of oldUrls) {
        if (url.includes(oldUrl) && !session && !url.includes('o=o')) {
            permanentRedirect(url.replace(oldUrl, 'https://www.hkviz.org'));
        }
    }

    return (
        <html lang="en">
            <head>
                <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd} />
                <FaviconsHead theme={theme} />
            </head>
            <body
                className={`${isDarkTheme ? 'dark' : ''} font-sans ${notoSans.variable} ${cinzel.variable} ${
                    cinzelDecorative.variable
                } ${ebGaramond.variable}`}
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
