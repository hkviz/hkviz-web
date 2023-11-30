import { Inter, EB_Garamond, Cinzel } from 'next/font/google';
import localFont from 'next/font/local';

export const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
});

export const ebGaramond = EB_Garamond({
    subsets: ['latin'],
    variable: '--font-serif',
});

export const cinzel = Cinzel({
    subsets: ['latin'],
    variable: '--font-serif',
});

export const materialSymbols = localFont({
    src: '../../node_modules/material-symbols/material-symbols-sharp.woff2',
    display: 'block',
});
