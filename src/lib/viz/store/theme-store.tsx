import { createContext, createSignal, JSXElement, useContext } from 'solid-js';
// import { effect } from 'solid-js/web';
// import { COOKIE_NAME_THEME } from '~/lib/cookies/cookie-names';
// import { cookiesClientRead } from '~/lib/cookies/cookies-client';

export type Theme = 'light' | 'dark';

export function createThemeStore() {
	let initialTheme: Theme = 'dark';
	if (typeof window !== 'undefined') {
		initialTheme = window.document.body.classList.contains('dark') ? 'dark' : 'light';
	}

	const [currentTheme, setCurrentTheme] = createSignal<Theme>('dark');

	return {
		currentTheme,
		setCurrentTheme,
	};
}

export type ThemeStore = ReturnType<typeof createThemeStore>;

// // todo probably should use context instead of global store, especially for server side rendering
// if (typeof window !== 'undefined') {
// 	effect(() => {
// 		// just using effect, to delay execution until after hydration
// 		// console.log('theme store init', window.document.body.classList.contains('dark') ? 'dark' : 'light');
// 		// const theme = window.document.body.classList.contains('dark') ? 'dark' : 'light';
// 		const theme = cookiesClientRead(COOKIE_NAME_THEME) === 'light' ? 'light' : 'dark';
// 		setCurrentTheme(theme);
// 	});
// }

export const ThemeContext = createContext<ThemeStore>();

export function useThemeStore() {
	const store = useContext(ThemeContext);
	if (!store) {
		throw new Error('theme store not defined in context');
	}
	return store;
}
