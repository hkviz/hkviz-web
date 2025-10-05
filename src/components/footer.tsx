import { A, useLocation } from '@solidjs/router';
import { createEffect, createMemo, type Component } from 'solid-js';
import { HKVizText } from './HKVizText';
import { DiscordDialogButton, GithubButton, MailButton } from './socials-links';
import { Expander } from './ui/additions';
import { Button } from './ui/button';
import { useUiStore } from '~/lib/viz';

export const Footer: Component = () => {
	const uiStore = useUiStore();
	const location = useLocation();

	const isVisible = createMemo(() => uiStore.mobileTab() === 'overview' || !location.pathname.startsWith('/run/'));

	createEffect(() => {
		if (isVisible()) {
			document.body.classList.remove('overflow-hidden');
		} else {
			document.body.classList.add('overflow-hidden');
		}
	});

	return (
		<Expander expanded={isVisible()}>
			<footer class="flex min-h-(--footer-height) w-full flex-col items-center justify-center bg-background">
				<div class="grid w-full max-w-[900px] grid-cols-1 p-4 sm:grid-cols-[1fr_2fr_1fr]">
					<div class="text-balance text-center text-sm text-foreground opacity-80 sm:text-left">
						<HKVizText /> is not affiliated with Team Cherry. Hollow Knight and all related indicia are
						trademarks of{' '}
						<a class="hover:underline" href="https://teamcherry.com.au" target="_blank" rel="noreferrer">
							Team Cherry
						</a>{' '}
						© 2017
					</div>
					<div class="flex w-full flex-row flex-wrap items-center justify-center">
						<Button as={A} href="/guide/install" variant="link" class="text-foreground opacity-80">
							Getting started
						</Button>
						<Button as={A} href="/credits" variant="link" class="text-foreground opacity-80">
							Credits
						</Button>
						<Button as={A} href="/privacy-policy" variant="link" class="text-foreground opacity-80">
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
