import { useSearchParams } from '@solidjs/router';
import { For, Show, createMemo, onMount, type Component } from 'solid-js';
import { TagDropdownMenu } from '~/components/run-tags';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { RUN_SORT_DEFAULT, runSortFromCode, runSorts, type RunSortCode } from '~/lib/types/run-sort';
import { isTag, tagOrGroupFromCode, type Tag, type TagGroup } from '~/lib/types/tags';
import { cn } from '~/lib/utils';
import { type RunFilterParams } from '~/server/run/find-public-runs';

function withoutDefaultParams(params: RunFilterParams) {
	return {
		...params,
		sort: params.sort === RUN_SORT_DEFAULT ? undefined : params.sort,
	};
}

export const RunFilters: Component<{ searchParams: RunFilterParams; class?: string }> = (props) => {
	const [searchParams, setSearchParams] = useSearchParams();

	const tagOrGroup = createMemo(() =>
		props.searchParams.tag ? tagOrGroupFromCode(props.searchParams.tag) : undefined,
	);
	const sort = createMemo(() => runSortFromCode(props.searchParams.sort ?? RUN_SORT_DEFAULT));

	onMount(() => {
		setSearchParams(withoutDefaultParams(props.searchParams));
	});

	function setTagFilter(tagOrGroup: TagGroup | Tag | undefined) {
		setSearchParams(
			withoutDefaultParams({
				...searchParams,
				tag: tagOrGroup?.code,
			}),
		);
	}

	function setSort(sort: RunSortCode) {
		setSearchParams(
			withoutDefaultParams({
				...searchParams,
				sort,
			}),
		);
	}

	function getColorClass(tagOrGroup: TagGroup | Tag) {
		if (isTag(tagOrGroup)) {
			return tagOrGroup.color.className;
		} else {
			return 'bg-transparent';
		}
	}

	return (
		<Card class={cn('flex flex-row gap-2 p-4', props.class)}>
			<TagDropdownMenu onClick={setTagFilter} showAllOptions={true}>
				<DropdownMenuTrigger as={Button<'button'>} variant="outline">
					<span class="mr-2 opacity-60">Tag:</span>{' '}
					<Show when={tagOrGroup()} fallback="All">
						{(tagOrGroup) => (
							<Show when={isTag(tagOrGroup())} fallback={`All ${tagOrGroup().name}`}>
								<Badge class={getColorClass(tagOrGroup())}>{tagOrGroup().name}</Badge>
							</Show>
						)}
					</Show>
				</DropdownMenuTrigger>
			</TagDropdownMenu>
			<div class="grow"></div>
			<DropdownMenu>
				<DropdownMenuTrigger as={Button<'button'>} variant="outline">
					<span class="mr-2 opacity-60">Sort:</span>
					{sort().name}
				</DropdownMenuTrigger>
				<DropdownMenuContent class="w-32">
					<For each={runSorts}>
						{(sort) => <DropdownMenuItem onSelect={() => setSort(sort.code)}>{sort.name}</DropdownMenuItem>}
					</For>
				</DropdownMenuContent>
			</DropdownMenu>
		</Card>
	);
};
