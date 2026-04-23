import { Title } from '@solidjs/meta';
import { RouteDefinition, useSearchParams } from '@solidjs/router';
import { createMemo, Show } from 'solid-js';
import * as v from 'valibot';
import { AuthNeeded } from '~/components/auth-needed';
import { ContentCenterWrapper } from '~/components/content-wrapper';
import { RunFilters } from '~/components/run-filters';
import { RunList } from '~/components/run-list';
import { useSession } from '~/lib/auth/client';
import { findOwnRuns, RunOwnInput } from '~/server/run/find-own-runs';
import { RunFilterParamsSchema } from '~/server/run/find-public-runs';
import { filterParamsAtPage } from '~/server/run/find_runs_base';

function loadPage(params: RunOwnInput) {
	params.archived = true;
	return findOwnRuns(params);
}

export const route = {
	load({ location }) {
		const filter: RunOwnInput = { ...location.query, archived: true };
		void loadPage(filterParamsAtPage(filter, 0));
	},
} satisfies RouteDefinition;

export default function ArchivePage() {
	const [searchParams, _setSearchParams] = useSearchParams();
	const filter = createMemo(() => v.parse(RunFilterParamsSchema, searchParams));

	const session = useSession();
	const userId = () => session()?.user?.id;

	return (
		<>
			<Title>Archived gameplays - HKViz</Title>
			<Show when={userId()} fallback={<AuthNeeded />}>
				<ContentCenterWrapper>
					<div class="w-full max-w-200">
						<h1 class="mt-4 mb-4 pl-2 text-center font-serif text-3xl font-semibold">
							Your archived gameplays
						</h1>
						<RunFilters class="mb-4" searchParams={searchParams} />
						<RunList filter={filter()} loadPage={loadPage} showUser={false} isOwnRun={() => true} />
					</div>
				</ContentCenterWrapper>
			</Show>
		</>
	);
}
