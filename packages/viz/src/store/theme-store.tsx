import { createSignal } from 'solid-js';

export type Theme = 'light' | 'dark';

const [currentTheme, setCurrentTheme] = createSignal<Theme>('light');

export const themeStore = {
    currentTheme,
    setCurrentTheme,
};
