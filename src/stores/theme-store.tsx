import { createSignal } from 'solid-js';

export type Theme = 'light' | 'dark';

const [currentTheme, setCurrentTheme] = createSignal<Theme>('dark');

export const themeStore = {
	currentTheme,
	setCurrentTheme,
};

// todo probably should use context instead of global store, especially for server side rendering
if (typeof window !== 'undefined') {
	console.log('theme store init', window.document.body.classList.contains('dark') ? 'dark' : 'light');
	const theme = window.document.body.classList.contains('dark') ? 'dark' : 'light';
	setCurrentTheme(theme);
}
