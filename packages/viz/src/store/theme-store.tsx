import { createSignal } from '../preact-solid-combat';

export type Theme = 'light' | 'dark';

const [currentTheme, setCurrentTheme] = createSignal<Theme>('light');

export const themeStore = {
    currentTheme,
    setCurrentTheme,
};
