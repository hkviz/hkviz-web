import '~/styles/globals.css';

import { cookies } from 'next/headers';

import { Toaster } from '@/components/ui/toaster';
import { type Metadata } from 'next';
import { cinzel, cinzelDecorative, ebGaramond, notoSans } from '~/styles/fonts';
import { TRPCReactProvider } from '~/trpc/react';
import ClientContext from './_components/context';
import { Footer } from './_components/footer';
import { MainNav } from './_components/main-nav';
import { FaviconsHead } from './_favicons-head';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { COOKIE_NAME_THEME } from '~/lib/cookie-names';

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

const jsonLd = {
    __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        url: 'https://www.hkviz.org',
        name: 'HKViz',
    }),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const isDarkTheme = cookies().get(COOKIE_NAME_THEME)?.value !== 'light';
    const theme = isDarkTheme ? 'dark' : 'light';

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
                            <MainNav theme={theme} />
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
