import {
	type RouteDefinition,
	type RouteSectionProps,
	createAsync,
	useLocation,
	useSearchParams,
} from '@solidjs/router';
import { Show, createMemo } from 'solid-js';
import { RunCard } from '~/components/run-card';
import { RunFilterParamsSchema, findPublicRuns } from '~/server/run/find-public-runs';
import { ContentWrapper } from '../../components/content-wrapper';
import { RunFilters } from './_components';
import * as v from 'valibot';
import { tagOrGroupFromCode } from '~/lib/types/tags';
import { Title } from '@solidjs/meta';
import { Key } from '@solid-primitives/keyed';

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

export default function Runs() {
	const [searchParams, setSearchParams] = useSearchParams();
	const filter = createMemo(() => v.parse(RunFilterParamsSchema, searchParams));
	const runs = createAsync(() => findPublicRuns(filter()));

	const title = () => {
		const filterTag = filter().tag;
		const tagOrGroup = filterTag ? tagOrGroupFromCode(filterTag) : undefined;
		if (tagOrGroup) {
			return `${tagOrGroup.name} Gameplays - HKViz`;
		} else {
			return 'Public gameplays - HKViz';
		}
	};

	return (
		<ContentWrapper>
			<Title>{title()}</Title>
			<div class="container flex flex-col items-center justify-center gap-12 px-4 py-16">
				<div class="w-full max-w-[800px]">
					<h1 class="mb-4 pl-2 text-center font-serif text-3xl font-semibold">Public gameplays</h1>

					<RunFilters searchParams={filter()} class="mb-4" />

					<Show when={runs()}>
						{(runs) => (
							<Show when={runs().length > 0} fallback={<p class="text-center">No gameplays found</p>}>
								<ul class="flex flex-col">
									<Key each={runs()} by={(it) => it.id}>
										{(run) => (
											<li>
												<RunCard run={run()} showUser={true} />
											</li>
										)}
									</Key>
								</ul>
							</Show>
						)}
					</Show>
				</div>
			</div>
		</ContentWrapper>
	);
}
