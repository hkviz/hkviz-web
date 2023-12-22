import { create } from 'zustand';
import { combine } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

function createCookie(name: string, value: string, days: number) {
    let expires: string;
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
    } else {
        expires = '';
    }
    document.cookie = name + '=' + value + expires + '; path=/';
}

function readCookie(name: string) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let c of ca) {
        while (c.startsWith(' ')) {
            c = c.substring(1, c.length);
        }
        if (c.startsWith(nameEQ)) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
}

function eraseCookie(name: string) {
    createCookie(name, '', -1);
}

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
        }
        function toggleTheme() {
            setTheme(get().theme === 'dark' ? 'light' : 'dark');
        }
        return { setTheme, toggleTheme, setThemeNoApply };
    }),
);
