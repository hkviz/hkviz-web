import { themeStore as themeStoreSolid } from '@hkviz/viz';
import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { createCookieFromClient } from '~/lib/client-cookies';
import { getThemeColorByTheme } from '~/lib/theme';
import { COOKIE_NAME_THEME } from '../cookie-names';

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

themeStoreSolid.setCurrentTheme(getThemeFromCookies() ?? 'light');

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
            createCookieFromClient(COOKIE_NAME_THEME, theme, 365 * 5);
            const root = document.getElementsByTagName('body')[0]!;
            if (theme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getThemeColorByTheme(theme));
            themeStoreSolid.setCurrentTheme(theme);
        }
        function toggleTheme() {
            setTheme(get().theme === 'dark' ? 'light' : 'dark');
        }
        return { setTheme, toggleTheme, setThemeNoApply };
    }),
);

export const themeStore = {
    ...themeStoreSolid,
};
