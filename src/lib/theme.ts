import { type Theme } from '~/lib/client-stage/theme-store';

export function getThemeColorByTheme(theme: Theme) {
    return theme === 'light' ? '#ffffff' : '#030712';
}
