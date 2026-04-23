import { Title } from '@solidjs/meta';
import { type RouteDefinition, useSearchParams } from '@solidjs/router';
import { createMemo } from 'solid-js';
import * as v from 'valibot';
import { RunList } from '~/components/run-list';
import { tagOrGroupFromCode } from '~/lib/types/tags/tags';
import { findPublicRuns } from '~/server/run/find-public-runs';
import { filterParamsAtPage, runFilterBaseNoPageSchema } from '~/server/run/find_runs_base';
import { ContentWrapper } from '../../components/content-wrapper';
import { RunFilters } from '../../components/run-filters';

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
	preload: ({ location }) => {
		void findPublicRuns(filterParamsAtPage(location.query as any, 0));
	},
} satisfies RouteDefinition;

export default function PublicRuns() {
	const [searchParams, _setSearchParams] = useSearchParams();
	const filter = createMemo(() => v.parse(runFilterBaseNoPageSchema, searchParams));

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
			<div class="container mx-auto flex w-full flex-col items-center justify-center gap-12 px-4 py-16">
				<div class="w-full max-w-200">
					<h1 class="mb-4 pl-2 text-center font-serif text-3xl font-semibold">Public Gameplays</h1>

					<RunFilters filter={filter()} class="mb-4" />

					<RunList filter={filter()} loadPage={findPublicRuns} showUser={true} />
				</div>
			</div>
		</ContentWrapper>
	);
}
