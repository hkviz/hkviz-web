import { Key } from '@solid-primitives/keyed';
import { createAsync, RouteDefinition, useSearchParams } from '@solidjs/router';
import { createMemo, Show } from 'solid-js';
import * as v from 'valibot';
import { ContentCenterWrapper } from '~/components/content-wrapper';
import { RunCard } from '~/components/run-card';
import { findPublicRuns, RunFilterParamsSchema } from '~/server/run/find-public-runs';
import { RunFilters } from '../run/_components';

interface Params {
	id: string;
}

export const route = {
	load({ location, params }) {
		void findPublicRuns({ ...location.query, userId: params.id });
	},
} satisfies RouteDefinition;

export default function PublicPlayerPage(props: { params: Params }) {
	const [searchParams, _] = useSearchParams();
	const filter = createMemo(() => v.parse(RunFilterParamsSchema, { ...searchParams, userId: props.params.id }));
	const runs = createAsync(() => findPublicRuns(filter()));
	const userName = createMemo(() => runs()?.[0]?.user?.name ?? 'Unnamed player');

	return (
		<ContentCenterWrapper>
			<div class="container flex flex-col items-center justify-center gap-12 px-4 py-16">
				<div class="w-full max-w-[800px]">
					<Show
						when={runs()?.length}
						fallback={<p class="text-center">This player does not exist or has no public gameplays</p>}
					>
						<h1 class="mb-4 pl-2 text-center font-serif text-3xl font-semibold">
							{userName()}
							{"'"}s gameplays
						</h1>
						<RunFilters searchParams={filter()} class="mb-4" />
						<ul class="flex flex-col">
							<Key each={runs()} by={(it) => it.id}>
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
