'use client';

import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { NavigationMenuLink } from '@radix-ui/react-navigation-menu';
import { Moon, Sun } from 'lucide-react';
import { useMemo } from 'react';
import { useThemeStore } from '../../lib/stores/theme-store';

export type Theme = 'light' | 'dark';

export function ThemeSwitcher({ theme }: { theme: Theme }) {
    const setThemeNoApply = useThemeStore((state) => state.setThemeNoApply);
    useMemo(() => setThemeNoApply(theme), [theme, setThemeNoApply]);
    const _theme = useThemeStore((state) => state.theme) ?? theme;
    const toggleTheme = useThemeStore((state) => state.toggleTheme);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                    <button onClick={toggleTheme}>
                        {_theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    </button>
                </NavigationMenuLink>
            </TooltipTrigger>
            <TooltipContent>{_theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}</TooltipContent>
        </Tooltip>
    );
}
