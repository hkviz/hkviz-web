import { Moon, Sun } from 'lucide-solid';
import { type Component, Show } from 'solid-js';
import { COOKIE_NAME_THEME } from '~/lib/cookies/cookie-names';
import { cookiesClientSet } from '~/lib/cookies/cookies-client';
import { useThemeStore } from '~/lib/viz/store/theme-store';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export type Theme = 'light' | 'dark';

export const ThemeSwitcher: Component = () => {
	const themeStore = useThemeStore();

	function toggleTheme() {
		const theme = themeStore.currentTheme() === 'light' ? 'dark' : 'light';
		themeStore.setCurrentTheme(theme);
		cookiesClientSet(COOKIE_NAME_THEME, theme, 365 * 5);
	}

	return (
		<Tooltip>
			<TooltipTrigger as={Button<'button'>} variant="ghost" onClick={toggleTheme} class="app-region-no-drag">
				<Show when={themeStore.currentTheme() === 'light'} fallback={<Moon class="h-5 w-5" />}>
					<Sun class="h-5 w-5" />
				</Show>
			</TooltipTrigger>
			<TooltipContent>
				{themeStore.currentTheme() === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
			</TooltipContent>
		</Tooltip>
	);
};
