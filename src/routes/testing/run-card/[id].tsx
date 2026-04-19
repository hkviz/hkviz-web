import { Title } from '@solidjs/meta';
import { createAsync, type RouteDefinition, RouteSectionProps } from '@solidjs/router';
import { createSignal, For, Show } from 'solid-js';
import { ContentWrapper } from '~/components/content-wrapper';
import { RunCard } from '~/components/run-card/run-card';
import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';
import { toolCrestIdToNameSilk } from '~/lib/game-data/silk-data/tool-crest-silk.generated';
import { findPublicRuns } from '~/server/run/find-public-runs';
import { getRun } from '~/server/run/run-get';

import {
	BellhomePaintColoursSilk,
	ExtraRestZonesSilk,
	MapZoneSilk,
} from '~/lib/game-data/silk-data/player-data-silk.generated';
import { RunGameStateSilk } from '~/server/run/run-column-selects';
import '../_testing_styles.css';

// TODO
// export function generateMetadata({ searchParams }: { searchParams: RunFilter }) {
//     const filter = runFilterParamsSchema.parse(searchParams);
//     const tagOrGroup = filter.tag ? tagOrGroupFromCode(filter.tag) : undefined;

//     const title = tagOrGroup ? `${tagOrGroup.name} - Public gameplays - HKViz` : 'Public gameplays - HKViz';

//     return {
//         title,
//         alternates: {
//             canonical: '/run',
//         },
//     };
// }

export const route = {
	load({ location }) {
		void findPublicRuns(location.query);
	},
} satisfies RouteDefinition;

export default function Runs(props: RouteSectionProps) {
	const id = () => props.params.id;
	const runData = createAsync(() => getRun(id()!));

	const [varyCrest, setVaryCrest] = createSignal(false);
	const [varySteelsoul, setVarySteelsoul] = createSignal(false);
	const [varyBackground, setVaryBackground] = createSignal(false);

	const title = () => {
		return 'UI Testing - HKViz';
	};

	const runs = () => {
		const run = runData();
		if (!run) return [];

		if (run.gameState.game === 'silk') {
			let runs = [run];

			if (varyBackground()) {
				const newRuns = [];
				for (const run of runs) {
					for (const mapZone of MapZoneSilk.nameList) {
						const newRun = { ...run };
						newRun.gameState = {
							...(run.gameState as RunGameStateSilk),
							mapZone,
							extraRestZones: ExtraRestZonesSilk.byName.None,
						};
						newRuns.push(newRun);
					}
					for (const extraRestZones of Object.values(ExtraRestZonesSilk.byName)) {
						const newRun = { ...run };
						newRun.gameState = {
							...(run.gameState as RunGameStateSilk),
							extraRestZones,
							belltownHouseColour: BellhomePaintColoursSilk.byName.None,
						};
						newRuns.push(newRun);
					}
					for (const color of Object.values(BellhomePaintColoursSilk.byName)) {
						const newRun = { ...run };
						newRun.gameState = {
							...(run.gameState as RunGameStateSilk),
							extraRestZones: ExtraRestZonesSilk.byName.Bellhome,
							belltownHouseColour: color,
						};
						newRuns.push(newRun);
					}
				}
				runs = newRuns;
			}
			if (varyCrest()) {
				const newRuns = [];
				for (const run of runs) {
					if (!run.isBrokenSteelSoul) {
						for (const [_, crestName] of toolCrestIdToNameSilk) {
							const newRun = { ...run };
							newRun.gameState = {
								...(run.gameState as RunGameStateSilk),
								currentCrestId: crestName,
							};
							newRuns.push(newRun);
						}
					} else {
						newRuns.push(run);
					}
				}
				runs = newRuns;
			}
			if (varySteelsoul()) {
				const newRuns = [];

				for (const run of runs) {
					for (const v of [0, 1, 2]) {
						const newRun = {
							...run,
							gameState: {
								...(run.gameState as RunGameStateSilk),
								permadeathMode: v,
							},
							isSteelSoul: v !== 0,
							isBrokenSteelSoul: v === 2,
						};
						newRuns.push(newRun);
					}
				}

				runs = newRuns;
			}
			return runs;
		}
		return [run];
	};

	return (
		<ContentWrapper>
			<Title>{title()}</Title>
			<div class="container mx-auto flex w-full flex-col items-center justify-center gap-12 px-4 py-16">
				<div class="w-full max-w-200">
					<h1 class="mb-4 pl-2 text-center font-serif text-3xl font-semibold">UI Testing</h1>

					<div class="mb-4 flex items-center gap-4">
						<div class="flex gap-2">
							<Checkbox id="varyCrest" checked={varyBackground()} onChange={setVaryBackground} />
							<Label for="varyCrest">Vary Background</Label>
						</div>
					</div>
					<div class="mb-4 flex items-center gap-4">
						<div class="flex gap-2">
							<Checkbox id="varyCrest" checked={varySteelsoul()} onChange={setVarySteelsoul} />
							<Label for="varyCrest">Vary Steelsoul</Label>
						</div>
					</div>
					<div class="mb-4 flex items-center gap-4">
						<div class="flex gap-2">
							<Checkbox id="varyCrest" checked={varyCrest()} onChange={setVaryCrest} />
							<Label for="varyCrest">Vary Crest</Label>
						</div>
					</div>

					<Show when={runs()}>
						{(runs) => (
							<Show when={runs().length > 0} fallback={<p class="text-center">No gameplays found</p>}>
								<ul class="flex flex-col">
									<For each={runs()}>
										{(run) => (
											<li class="relative">
												<RunCard run={run} showUser={true} />
											</li>
										)}
									</For>
								</ul>
							</Show>
						)}
					</Show>
				</div>
			</div>
		</ContentWrapper>
	);
}
