import { Noto_Sans, Cinzel } from 'next/font/google';
import localFont from 'next/font/local';

export const notoSans = Noto_Sans({
    subsets: ['latin'],
    weight: ['400', '700', '900'],
    variable: '--font-sans',
    display: 'swap',
});

// export const ebGaramond = EB_Garamond({
//     subsets: ['latin'],
//     variable: '--font-serif',
//     display: 'swap',
// });

export const cinzel = Cinzel({
    subsets: ['latin'],
    variable: '--font-serif',
    display: 'swap',
});

export const materialSymbols = localFont({
    src: '../../node_modules/material-symbols/material-symbols-sharp.woff2',
    display: 'block',
});
