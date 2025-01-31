import { Title } from '@solidjs/meta';
import { A, createAsync, RouteDefinition } from '@solidjs/router';
import { ContentCenterWrapper } from '~/components/content-wrapper';
import { FancyButton } from '~/components/fancy-button';
import { HKVizText } from '~/components/HKVizText';
import { OwnRuns } from '~/components/own-runs';
import { GradientSeparator } from '~/components/ui/additions';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { findOwnRuns } from '~/server/run/find-own-runs';

export const route = {
	load: () => {
		void findOwnRuns();
	},
} satisfies RouteDefinition;

export default function HomePage() {
	const runs = createAsync(() => findOwnRuns());
	return (
		<ContentCenterWrapper>
			<Title>HKViz for Hollow Knight</Title>
			<div class="container flex flex-col items-center justify-center gap-12 px-4 py-16 text-foreground">
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
					<p class="text-pretty pt-4">
						With <HKVizText /> you can record gameplay analytics of your Hollow Knight gameplays, and share
						them with others.
					</p>

					{runs() && runs()!.length === 0 && (
						<div class="flex flex-row items-center justify-center py-8 transition sm:gap-12">
							<FancyButton as={A} href="/guide/install">
								Record Gameplay Analytics
							</FancyButton>
						</div>
					)}
				</div>

				<OwnRuns runs={runs()!} />

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
