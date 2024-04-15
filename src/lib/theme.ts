import { type Theme } from '~/lib/stores/theme-store';

export function getThemeColorByTheme(theme: Theme) {
    return theme === 'light' ? '#ffffff' : '#030712';
}
