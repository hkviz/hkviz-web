import { debounce } from '@solid-primitives/scheduled';
import { useSearchParams } from '@solidjs/router';
import { SearchIcon, XIcon } from 'lucide-solid';
import { For, Show, createEffect, createMemo, createSignal, onMount, untrack, type Component } from 'solid-js';
import { TagDropdownMenu } from '~/components/run-card/run-card-tags.tsx';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { TextField, TextFieldInput } from '~/components/ui/text-field';
import { GameId, gameIdFromCode, gameIds, getGameName } from '~/lib/types/game-ids';
import { RUN_SORT_DEFAULT, runSortFromCode, runSorts, type RunSortCode } from '~/lib/types/run-sort';
import { isTag, tagOrGroupFromCode, type Tag, type TagGroup } from '~/lib/types/tags/tags';
import { cn } from '~/lib/utils';
import { type RunFilterParams } from '~/server/run/find-public-runs';
import { FIND_RUN_TERM_MAX_LENGTH } from '~/server/run/find-run-constants';
import { RunFilterBaseNoPage } from '~/server/run/find_runs_base';

function withoutDefaultParams(params: Partial<RunFilterParams>) {
	return {
		...params,
		userId: undefined,
		archived: undefined,
		sort: params.sort === RUN_SORT_DEFAULT ? undefined : params.sort,
	};
}

export const RunFilters: Component<{ filter: RunFilterBaseNoPage; class?: string }> = (props) => {
	const [searchParams, setSearchParams] = useSearchParams();

	const tagOrGroup = createMemo(() => (props.filter.tag ? tagOrGroupFromCode(props.filter.tag) : undefined));
	const sort = createMemo(() => runSortFromCode(props.filter.sort ?? RUN_SORT_DEFAULT));
	const game = createMemo(() => gameIdFromCode(props.filter.game) ?? undefined);

	const [searchInputRef, setSearchInputRef] = createSignal<HTMLInputElement>();

	const alwaysOneLineFilters = () => {
		const tag = tagOrGroup();
		return (tag == null || tag.name.length <= 4) && game() == null;
	};

	onMount(() => {
		setSearchParams(withoutDefaultParams(props.filter));
	});

	let termHasChangedSinceRequest = false;
	// eslint-disable-next-line solid/reactivity
	const [searchTerm, setSearchTerm] = createSignal(props.filter.term ?? '');

	createEffect(() => {
		const newPropTerm = props.filter.term ?? '';
		if (!termHasChangedSinceRequest) {
			setSearchTerm(newPropTerm);
		}
	});

	const updateSearchTermQuery = debounce(() => {
		untrack(() => {
			const term = searchTerm().trim();
			termHasChangedSinceRequest = false;
			if (term !== (searchParams.term ?? '')) {
				setSearchParams(
					withoutDefaultParams({
						...searchParams,
						term: searchTerm() || undefined,
					}),
				);
			}
		});
	}, 300);

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

	function setGame(gameId: GameId | undefined) {
		setSearchParams(
			withoutDefaultParams({
				...searchParams,
				game: gameId,
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
		<div class={cn('relative isolate px-2 py-3', props.class)}>
			<div class="relative z-1 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
				<div class="flex grow flex-row gap-2">
					<TextField class="group relative grow md:max-w-85">
						<SearchIcon
							class={cn(
								'pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-foreground/60 transition',
								searchTerm()
									? 'translate-x-4 opacity-0'
									: 'group-focus-within:translate-x-4 group-focus-within:opacity-0',
							)}
						/>
						<TextFieldInput
							type="text"
							ref={setSearchInputRef}
							placeholder="Search..."
							value={searchTerm()}
							maxLength={FIND_RUN_TERM_MAX_LENGTH}
							class={cn(
								'border-transparent bg-background/55 shadow-sm ring-1 ring-white/10 outline-hidden transition-all',
								searchTerm() ? 'pl-4' : 'pl-8 group-focus-within:pl-4',
							)}
							onChange={(v: any) => {
								setSearchTerm(v.target.value);
								termHasChangedSinceRequest = true;
								updateSearchTermQuery();
							}}
							onInput={(v: any) => {
								setSearchTerm(v.target.value);
								termHasChangedSinceRequest = true;
								updateSearchTermQuery();
							}}
						/>
						<Show when={searchTerm().length > 0}>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => {
									setSearchTerm('');
									termHasChangedSinceRequest = true;
									updateSearchTermQuery();
									searchInputRef()?.focus();
								}}
								class="absolute top-0 right-0"
							>
								<XIcon class="h-4 w-4" />
							</Button>
						</Show>
					</TextField>
				</div>
				<div class={cn('flex gap-2', alwaysOneLineFilters() ? 'flex-row' : 'flex-col sm:flex-row')}>
					<DropdownMenu>
						<DropdownMenuTrigger
							as={Button<'button'>}
							variant="outline"
							class="grow justify-start border-transparent bg-background/50 ring-1 ring-white/10 md:grow-0"
						>
							<span class="mr-2 text-foreground/60">Game:</span>
							{game() ? getGameName(game()!) : 'All'}
						</DropdownMenuTrigger>
						<DropdownMenuContent class="w-32">
							<DropdownMenuItem onSelect={() => setGame(undefined)}>All</DropdownMenuItem>
							<For each={gameIds}>
								{(gameId) => (
									<DropdownMenuItem onSelect={() => setGame(gameId)}>
										{getGameName(gameId)}
									</DropdownMenuItem>
								)}
							</For>
						</DropdownMenuContent>
					</DropdownMenu>
					<TagDropdownMenu
						onClick={setTagFilter}
						showAllOptions={true}
						games={game() ? [game()!] : undefined}
					>
						<DropdownMenuTrigger
							as={Button<'button'>}
							variant="outline"
							class="grow justify-start border-transparent bg-background/50 ring-1 ring-white/10 md:grow-0"
						>
							<span class="mr-2 text-foreground/60">Tag:</span>{' '}
							<Show when={tagOrGroup()} fallback="All">
								{(tagOrGroup) => (
									<Show when={isTag(tagOrGroup())} fallback={`${tagOrGroup().name}`}>
										<Badge class={getColorClass(tagOrGroup())}>{tagOrGroup().name}</Badge>
									</Show>
								)}
							</Show>
						</DropdownMenuTrigger>
					</TagDropdownMenu>
					<DropdownMenu>
						<DropdownMenuTrigger
							as={Button<'button'>}
							variant="outline"
							class="grow justify-start border-transparent bg-background/50 ring-1 ring-white/10 md:grow-0"
						>
							<span class="mr-2 text-foreground/60">Sort:</span>
							{sort().name}
						</DropdownMenuTrigger>
						<DropdownMenuContent class="w-32">
							<For each={runSorts}>
								{(sort) => (
									<DropdownMenuItem onSelect={() => setSort(sort.code)}>{sort.name}</DropdownMenuItem>
								)}
							</For>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>
	);
};
