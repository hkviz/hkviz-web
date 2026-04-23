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
import { filterParamsAtPage, runFilterBaseNoPageSchema } from '~/server/run/find_runs_base';

export const route = {
	load({ location }) {
		void findOwnRuns(filterParamsAtPage<RunOwnInput>({ ...location.query, archived: true }, 0));
	},
} satisfies RouteDefinition;

export default function ArchivePage() {
	const [searchParams, _setSearchParams] = useSearchParams();
	const filter = createMemo(() => ({ ...v.parse(runFilterBaseNoPageSchema, searchParams), archived: true }));

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
						<RunFilters class="mb-4" filter={filter()} />
						<RunList filter={filter()} loadPage={findOwnRuns} showUser={false} isOwnRun={() => true} />
					</div>
				</ContentCenterWrapper>
			</Show>
		</>
	);
}
