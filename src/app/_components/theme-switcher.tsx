'use client';

import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { NavigationMenuLink } from '@radix-ui/react-navigation-menu';
import { MatSymbol } from './mat-symbol';
import { useThemeStore } from './theme-store';
import { useMemo } from 'react';

export type Theme = 'light' | 'dark';

export function ThemeSwitcher({ theme }: { theme: Theme }) {
    const setThemeNoApply = useThemeStore((state) => state.setThemeNoApply);
    useMemo(() => setThemeNoApply(theme), [theme, setThemeNoApply]);
    const _theme = useThemeStore((state) => state.theme) ?? theme;
    const toggleTheme = useThemeStore((state) => state.toggleTheme);

    return (
        <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
            <button onClick={toggleTheme}>
                {_theme === 'light' ? <MatSymbol icon="dark_mode" /> : <MatSymbol icon="light_mode" />}
            </button>
        </NavigationMenuLink>
    );
}
