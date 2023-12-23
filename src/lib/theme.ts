import { type Theme } from '~/app/_components/theme-store';

export function getThemeColorByTheme(theme: Theme) {
    return theme === 'light' ? '#ffffff' : '#030712';
}
