import { createEffect, createMemo, type Component } from 'solid-js';
import { AA, useLocation } from '~/lib/routing/AA';
import { isRunUrl } from '~/lib/routing/url';
import { useUiStore } from '~/lib/viz';
import { DiscordDialogButton, GithubButton, MailButton } from './socials-links';
import { Expander } from './ui/additions';
import { Button } from './ui/button';

export const Footer: Component = () => {
	const uiStore = useUiStore();
	const location = useLocation();

	const isVisible = createMemo(() => uiStore.mobileTab() === 'overview' || !isRunUrl(location.pathname));

	createEffect(() => {
		if (isVisible()) {
			document.body.classList.remove('overflow-hidden');
		} else {
			document.body.classList.add('overflow-hidden');
		}
	});

	return (
		<Expander expanded={isVisible()}>
			<footer class="flex min-h-(--footer-height) w-full flex-col items-center justify-center bg-background/90">
				<div class="grid w-full max-w-225 grid-cols-1 p-4 sm:grid-cols-[1fr_2fr_1fr]">
					<div class="text-center text-sm text-balance text-foreground opacity-80 sm:text-left">
						Hollow Knight and all related indicia are trademarks of{' '}
						<a class="hover:underline" href="https://teamcherry.com.au" target="_blank" rel="noreferrer">
							Team Cherry
						</a>{' '}
						© 2025
					</div>
					<div class="flex w-full flex-row flex-wrap items-center justify-center">
						<Button as={AA} href={'/guide/install'} variant="link" class="text-foreground opacity-80">
							Getting started
						</Button>
						<Button as={AA} href={'/changelog'} variant="link" class="text-foreground opacity-80">
							Changelog
						</Button>
						<Button as={AA} href={'/privacy-policy'} variant="link" class="text-foreground opacity-80">
							Privacy policy
						</Button>
					</div>
					<div class="flex items-center justify-center opacity-80 sm:justify-end">
						<MailButton />
						<DiscordDialogButton />
						<GithubButton />
					</div>
				</div>
			</footer>
		</Expander>
	);
};
