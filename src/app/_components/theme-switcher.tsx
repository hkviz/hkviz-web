'use client';

import { NavigationMenuLink } from '@radix-ui/react-navigation-menu';
import { useState } from 'react';
import { MatSymbol } from './mat-symbol';
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';

export type Theme = 'light' | 'dark';

export function ThemeSwitcher({ theme }: { theme: Theme }) {
    const [_theme, setTheme] = useState<Theme>(theme);

    const toogleTheme = () => {
        const root = document.getElementsByTagName('body')[0]!;
        root.classList.toggle('dark');
        if (root.classList.contains('dark')) {
            setTheme('dark');
            document.cookie = `theme=dark`;
        } else {
            setTheme('light');
            document.cookie = `theme=light`;
        }
    };

    return (
        <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
            <button onClick={toogleTheme}>
                {_theme === 'dark' ? <MatSymbol icon="light_mode" /> : <MatSymbol icon="dark_mode" />}
            </button>
        </NavigationMenuLink>
    );
}
