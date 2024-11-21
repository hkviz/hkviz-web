import { Title } from '@solidjs/meta';
import { createAsync, type RouteDefinition } from '@solidjs/router';
import { ContentCenterWrapper } from '~/components/content-wrapper';
import { HKVizText } from '~/components/HKVizText';
import { OwnRuns } from '~/components/own-runs';
import { GradientSeparator } from '~/components/ui/additions';
import { findOwnRuns } from '~/server/run/find-own-runs';

export const route: RouteDefinition = {
	load: () => {
		void findOwnRuns();
	},
};

export default function HomePage() {
	const runs = createAsync(() => findOwnRuns());
	return (
		<ContentCenterWrapper>
			<Title>HKViz for Hollow Knight</Title>
			<div class="container flex flex-col items-center justify-center gap-12 px-4 py-16 text-foreground">
				<div class={`max-w-[70ch] text-center`}>
					<h1 class={`title-text-glow -mb-6 font-serif text-[5rem] font-bold tracking-tight sm:text-[6rem]`}>
						<HKVizText />
					</h1>
					<h2 class="title-text-glow font-serif text-2xl sm:text-3xl">Visual Analytics for Hollow Knight</h2>
					<p class="text-pretty pt-4">
						With <HKVizText /> you can record gameplay analytics of your Hollow Knight gameplays, and share
						them with others.
					</p>

					{/* {userRuns.length == 0 && (
                        <div class="flex flex-row items-center justify-center py-8 transition sm:gap-12">
                            <Button asChild class="rounded-3xl p-8 text-2xl font-semibold shadow-md hover:shadow-lg">
                                <Link href="/guide/install">Record gameplay analytics</Link>
                            </Button>
                        </div>
                    )} */}
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
