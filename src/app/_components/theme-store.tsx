import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { createCookie } from '~/lib/cookies';
import { getThemeColorByTheme } from '~/lib/theme';

export type Theme = 'light' | 'dark';

function getThemeFromCookies(): Theme | undefined {
    if (typeof window === 'undefined') {
        return undefined;
    }
    return document.cookie
        .split('; ')
        .find((row) => row.startsWith('theme='))
        ?.split('=')?.[1] === 'light'
        ? 'light'
        : 'dark';
}

export const useThemeStore = create(
    combine({ theme: getThemeFromCookies() }, (set, get) => {
        function setThemeNoApply(theme: Theme) {
            set((state) => ({
                ...state,
                theme,
            }));
        }
        function setTheme(theme: Theme) {
            setThemeNoApply(theme);
            createCookie('theme', theme, 365 * 5);
            const root = document.getElementsByTagName('body')[0]!;
            if (theme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getThemeColorByTheme(theme));
        }
        function toggleTheme() {
            setTheme(get().theme === 'dark' ? 'light' : 'dark');
        }
        return { setTheme, toggleTheme, setThemeNoApply };
    }),
);
