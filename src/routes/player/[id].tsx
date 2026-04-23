import { createAsync, RouteDefinition, useSearchParams } from '@solidjs/router';
import { createMemo, Show } from 'solid-js';
import * as v from 'valibot';
import { ContentCenterWrapper } from '~/components/content-wrapper';
import { RunList } from '~/components/run-list';
import { findPublicPlayer } from '~/server/player/find-player-data';
import { findPublicRuns } from '~/server/run/find-public-runs';
import { filterParamsAtPage, runFilterBaseNoPageSchema } from '~/server/run/find_runs_base';
import { RunFilters } from '../../components/run-filters';

interface Params {
	id: string;
}

export const route = {
	preload: ({ location, params }) => {
		void findPublicRuns(filterParamsAtPage({ ...(location.query as any), userId: params.id }, 0));
		void findPublicPlayer({ playerId: params.id! });
	},
} satisfies RouteDefinition;

export default function PublicPlayerPage(props: { params: Params }) {
	const [searchParams, _] = useSearchParams();
	const filter = createMemo(() => ({
		...v.parse(runFilterBaseNoPageSchema, searchParams),
		userId: props.params.id,
	}));
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
						<h2 class="glowing-text-md text-center font-serif text-xl">Gameplays of</h2>
						<h1 class="glowing-text-md mb-4 pl-2 text-center font-serif text-4xl font-semibold first-letter:font-serifDecorative">
							{userName()}
						</h1>
						<RunFilters filter={filter()} class="mb-4" />
						<RunList filter={filter()} loadPage={findPublicRuns} showUser={false} isOwnRun={() => false} />
					</Show>
				</div>
			</div>
		</ContentCenterWrapper>
	);
}
