import { Key } from '@solid-primitives/keyed';
import { createAsync, RouteDefinition, useSearchParams } from '@solidjs/router';
import { createMemo, Show } from 'solid-js';
import * as v from 'valibot';
import { ContentCenterWrapper } from '~/components/content-wrapper';
import { RunCard } from '~/components/run-card';
import { findPublicPlayer } from '~/server/player/find-player-data';
import { findPublicRuns, RunFilterParamsSchema } from '~/server/run/find-public-runs';
import { RunFilters } from '../run/_components';

interface Params {
	id: string;
}

export const route = {
	load({ location, params }) {
		void findPublicRuns({ ...location.query, userId: params.id });
		void findPublicPlayer({ playerId: params.id! });
	},
} satisfies RouteDefinition;

export default function PublicPlayerPage(props: { params: Params }) {
	const [searchParams, _] = useSearchParams();
	const filter = createMemo(() => v.parse(RunFilterParamsSchema, searchParams));
	const runs = createAsync(() => findPublicRuns({ ...filter(), userId: props.params.id }));
	const player = createAsync(() => findPublicPlayer({ playerId: props.params.id }));
	const userName = createMemo(() => player()?.name ?? 'Unnamed player');

	return (
		<ContentCenterWrapper>
			<div class="container mx-auto flex w-full flex-col items-center justify-center gap-12 px-4 py-16">
				<div class="w-full max-w-200">
					<Show
						when={player()}
						fallback={<p class="text-center">This player does not exist or has no public gameplays</p>}
					>
						<h2 class="text-center font-serif text-xl">Gameplays of</h2>
						<h1 class="first-letter:font-serifDecorative mb-4 pl-2 text-center font-serif text-4xl font-semibold">
							{userName()}
						</h1>
						<RunFilters searchParams={filter()} class="mb-4" />
						<ul class="flex flex-col">
							<Key
								each={runs()}
								by={(it) => it.id}
								fallback={<div class="text-center">No gameplays found</div>}
							>
								{(run) => (
									<li>
										<RunCard run={run()} showUser={false} />
									</li>
								)}
							</Key>
						</ul>
					</Show>
				</div>
			</div>
		</ContentCenterWrapper>
	);
}
