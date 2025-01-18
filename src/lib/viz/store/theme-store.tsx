import { createAsync } from '@solidjs/router';
import { createContext, createEffect, createSignal, untrack, useContext } from 'solid-js';
import { COOKIE_NAME_THEME } from '~/lib/cookies/cookie-names';
import { cookiesClientRead } from '~/lib/cookies/cookies-client';
import { serverCookiesGetTheme } from '~/lib/cookies/cookies-server-theme-query';
import { createMutableMemo } from '~/lib/create-mutable-memo';
// import { effect } from 'solid-js/web';
// import { COOKIE_NAME_THEME } from '~/lib/cookies/cookie-names';
// import { cookiesClientRead } from '~/lib/cookies/cookies-client';

export type Theme = 'light' | 'dark';

export function getThemeColorByTheme(theme: 'light' | 'dark') {
	return theme === 'light' ? '#ffffff' : '#030712';
}

export function createThemeStore() {
	// todo move effect to here from theme-switcher
	// const initialTheme: Theme = 'dark';

	// if (typeof window !== 'undefined') {
	// 	initialTheme = window.document.body.classList.contains('dark') ? 'dark' : 'light';
	// }

	// const themeResource = createAsync(() => serverCookiesGetTheme());
	// const [currentTheme, setCurrentTheme] = createMutableMemo<Theme>(() => themeResource()!);

	const [currentTheme, setCurrentTheme] = createSignal<Theme>('dark');

	createEffect(() => {
		untrack(() => {
			const theme = cookiesClientRead(COOKIE_NAME_THEME) === 'light' ? 'light' : 'dark';
			setCurrentTheme(theme);
		});
	});

	createEffect(() => {
		if (typeof document !== 'undefined') {
			const theme = currentTheme();

			if (theme === 'dark') {
				document.body.classList.add('dark');
			} else {
				document.body.classList.remove('dark');
			}

			document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getThemeColorByTheme(theme));
		}
	});

	return {
		currentTheme,
		setCurrentTheme,
	};
}

export type ThemeStore = ReturnType<typeof createThemeStore>;

export const ThemeStoreContext = createContext<ThemeStore>();

export function useThemeStore() {
	const store = useContext(ThemeStoreContext);
	if (!store) {
		throw new Error('theme store not defined in context');
	}
	return store;
}
