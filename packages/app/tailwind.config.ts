import { type Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
    darkMode: ['class'],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
        './src/**/*.mdx',
        './@/components/**/*.{ts,tsx}',
        './next.config.mjs',
        '../viz/src/**/*.{ts,tsx}',
        '../viz-ui/src/**/*.{ts,tsx}',
        '../components/src/**/*.{ts,tsx}',
    ],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            fontFamily: {
                sans: ['var(--font-sans)', ...fontFamily.sans],
                serif: ['var(--font-serif)', ...fontFamily.serif],
                serifDecorative: ['var(--font-serif-decorative)', ...fontFamily.serif],
            },
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
            },
            borderRadius: {
                xl: 'calc(var(--radius) + 4px)',
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                'content-show': {
                    from: { opacity: '0', transform: 'scale(0.96)' },
                    to: { opacity: '1', transform: 'scale(1)' },
                },
                'content-hide': {
                    from: { opacity: '1', transform: 'scale(1)' },
                    to: { opacity: '0', transform: 'scale(0.96)' },
                },
                'pulse-shadow-white': {
                    '0%': { 'box-shadow': '0 0 0 0 rgba(255,255,255,0.3)' },
                    '75%, 100%': { 'box-shadow': '0 0 0 2rem transparent' },
                },
                'pulse-shadow-black': {
                    '0%': { 'box-shadow': '0 0 0 0 rgba(0,0,0,0.3)' },
                    '75%, 100%': { 'box-shadow': '0 0 0 2rem transparent' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'content-show': 'content-show 0.2s ease-out',
                'content-hide': 'content-hide 0.2s ease-out',
                'pulse-shadow-white': 'pulse-shadow-white 1.75s ease-in-out infinite',
                'pulse-shadow-black': 'pulse-shadow-black 1.75s ease-in-out infinite',
            },
            dropShadow: {
                'glow-sm': ['0 0px 3px rgba(255,255, 255, 0.2)', '0 0px 6px rgba(255, 255,255, 0.05)'],
                'glow-md': ['0 0px 5px rgba(255,255, 255, 0.3)', '0 0px 10px rgba(255, 255,255, 0.15)'],
            },
            transitionProperty: {
                'grid-rows': 'grid-template-rows',
            },
            screens: {
                hasHover: { raw: '(hover: hover)' },
            },
        },
    },
    plugins: [
        require('tailwindcss-animate'),
        require('@tailwindcss/typography'),
        require('@tailwindcss/container-queries'),
    ],
} satisfies Config;
