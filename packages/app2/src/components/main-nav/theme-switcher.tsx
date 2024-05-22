import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@hkviz/components';
import { themeStore } from '@hkviz/viz';
import { Moon, Sun } from 'lucide-solid';
import { type Component, Show } from 'solid-js';

export type Theme = 'light' | 'dark';

export const ThemeSwitcher: Component = () => {
    const theme = themeStore.currentTheme;

    return (
        <Tooltip>
            <TooltipTrigger as={Button<'button'>} variant="ghost" onClick={() => undefined}>
                <Show when={theme() === 'light'} fallback={<Moon class="h-5 w-5" />}>
                    <Sun class="h-5 w-5" />
                </Show>
            </TooltipTrigger>
            <TooltipContent>{theme() === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}</TooltipContent>
        </Tooltip>
    );
};
