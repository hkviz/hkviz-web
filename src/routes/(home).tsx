import { Title } from '@solidjs/meta';
import { createAsync, RouteDefinition } from '@solidjs/router';
import { Show } from 'solid-js';
import { ContentCenterWrapper } from '~/components/content-wrapper';
import { FancyButton } from '~/components/fancy-button';
import { HKVizText } from '~/components/HKVizText';
import { OwnRuns } from '~/components/own-runs';
import { GradientSeparator } from '~/components/ui/additions';
import { useUser } from '~/lib/auth/client';
import { AA } from '~/lib/routing/AA';
import { findOwnRuns } from '~/server/run/find-own-runs';

export const route = {
	load({ location: _location }) {
		void findOwnRuns({});
		// void findOwnRuns(location.query);
	},
} satisfies RouteDefinition;

export default function HomePage() {
	const runs = createAsync(() => findOwnRuns({}));
	const user = useUser();

	return (
		<ContentCenterWrapper>
			<Title>HKViz for Hollow Knight</Title>
			<div class="container mx-auto flex w-full flex-col items-center justify-center gap-12 px-4 py-16 text-foreground">
				<div class={`max-w-[70ch] text-center`}>
					<div class="start-page-header">
						<h1
							class={`title-text-glow -mb-6 font-serif text-[5rem] font-bold tracking-tight sm:text-[6rem]`}
						>
							<HKVizText />
						</h1>
						<h2 class="title-text-glow font-serif text-2xl sm:text-3xl">
							Visual Analytics for Hollow Knight
						</h2>
					</div>
					<p class="pt-4 text-pretty">
						With <HKVizText /> you can record gameplay analytics of your Hollow Knight gameplays, and share
						them with others.
					</p>

					{/* <div class="start-page-header text-center">
						<h1
							class={`title-text-glow -mb-2 font-serif text-[6rem] font-bold tracking-tight sm:text-[6rem]`}
						>
							<HKVizText />
						</h1>

						<h2 class="title-text-glow font-serif text-2xl sm:text-3xl">
							Analytics for
							<span class="mt-2 block text-3xl leading-[0.8] font-semibold sm:text-4xl">
								<span class="whitespace-nowrap">Hollow Knight</span>
								<span class="px-3 opacity-50">&</span>
								<span class="relative tracking-wider">Silksong</span>
							</span>
						</h2>
					</div>

					<p class="mx-auto max-w-xl pt-6 text-center text-pretty">
						With <HKVizText /> you can record and share gameplay analytics of your playthroughs.
					</p> */}

					{runs() && runs()!.length === 0 && (
						<div class="flex flex-row items-center justify-center py-8 transition sm:gap-12">
							<FancyButton as={AA} href="/guide/install">
								Record Gameplay Analytics
							</FancyButton>
						</div>
					)}
				</div>

				<Show when={user()}>
					<OwnRuns />
				</Show>

				<GradientSeparator />
				<div class={`max-w-[70ch] text-center`}>
					<p class="text-pretty">
						<HKVizText /> is developed to allow research on visual analytics and data visualization in
						Metroidvania games and is not affiliated with{' '}
						<a href="https://www.teamcherry.com.au/" target="_blank" class="hover:underline">
							Team Cherry
						</a>{' '}
						the creators of{' '}
						<a href="https://www.hollowknight.com/" target="_blank" class="hover:underline">
							Hollow Knight
						</a>
					</p>
				</div>
			</div>
		</ContentCenterWrapper>
	);
}
