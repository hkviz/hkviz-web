'use client';

import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { NavigationMenuLink } from '@radix-ui/react-navigation-menu';
import { Moon, Sun } from 'lucide-react';
import { useMemo } from 'react';
import { useThemeStore } from './theme-store';

export type Theme = 'light' | 'dark';

export function ThemeSwitcher({ theme }: { theme: Theme }) {
    const setThemeNoApply = useThemeStore((state) => state.setThemeNoApply);
    useMemo(() => setThemeNoApply(theme), [theme, setThemeNoApply]);
    const _theme = useThemeStore((state) => state.theme) ?? theme;
    const toggleTheme = useThemeStore((state) => state.toggleTheme);

    return (
        <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
            <button onClick={toggleTheme}>
                {_theme === 'light' ? <Moon /> : <Sun />}
            </button>
        </NavigationMenuLink>
    );
}
