import { useAction, useSubmission, useSubmissions } from '@solidjs/router';
import { PlusIcon, XIcon } from 'lucide-solid';
import { For, Show, createMemo, type Component, type JSXElement } from 'solid-js';
import { GameId } from '~/lib/types/game-ids.ts';
import {
	tagFromCode,
	tagGroups,
	ungroupedTagsNotRemoved,
	type Tag,
	type TagCode,
	type TagGroup,
} from '~/lib/types/tags.ts';
import { cn } from '~/lib/utils.ts';
import { addTagAction, removeTagAction } from '~/server/run/tags.ts';
import { Badge } from '../ui/badge.tsx';
import { Button } from '../ui/button.tsx';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu.tsx';
import { Skeleton } from '../ui/skeleton.tsx';

// TODO
export const RunTag: Component<{
	tag: Tag;
	runId: string;
	isOwn: boolean;
	removeButtonClass?: string;
}> = (props) => {
	const _removeTag = useAction(removeTagAction);
	const removeTagSubmission = useSubmission(
		removeTagAction,
		([runId, code]) => runId === props.runId && code === props.tag.code,
	);
	const addTagSubmission = useSubmissions(
		addTagAction,
		([runId, code]) => runId === props.runId && code === props.tag.code,
	);

	async function removeTag() {
		console.log('removeTag', props.tag.code);
		await _removeTag(props.runId, props.tag.code);
	}

	return (
		<Badge
			class={cn(
				'relative z-8 overflow-hidden',
				props.tag.color.className,
				removeTagSubmission.pending || addTagSubmission.pending ? 'opacity-50' : '',
			)}
		>
			<span>{props.tag.name}</span>
			<Show when={props.isOwn}>
				<Button
					variant="ghost"
					class={cn(
						'relative -m-2 -mr-3 ml-0 h-8 w-8 rounded-full hover:bg-white/10',
						props.removeButtonClass,
					)}
					size="icon"
					onClick={removeTag}
					disabled={
						removeTagSubmission.pending || addTagSubmission.pending || removeTagSubmission.result != null
					}
				>
					<XIcon class="h-3 w-3" />
				</Button>
			</Show>
		</Badge>
	);
};

export const RunCardTags: Component<{
	runGame: GameId;
	codes: TagCode[];
	runId: string;
	isOwn: boolean;
	class?: string;
	addButtonClass?: string;
	removeButtonClass?: string;
}> = (props) => {
	const _addTag = useAction(addTagAction);
	const addTagSubmission = useSubmissions(addTagAction, ([runId]) => runId === props.runId);
	const tagAdding = createMemo(() => addTagSubmission.map((it) => it.input[1]));

	const runTags = createMemo(() =>
		new Set([...props.codes, ...tagAdding()])
			.values()
			.toArray()
			.map(tagFromCode)
			.sort((a, b) => a.order - b.order),
	);

	async function addTag(tag: Tag) {
		await _addTag(props.runId, tag.code);
	}

	return (
		<div class={cn('items-[start] flex min-h-6 flex-row flex-wrap gap-1 font-sans', props.class)}>
			<ul class="flex flex-row flex-wrap-reverse items-end justify-end gap-1">
				<Show when={props.isOwn}>
					<li>
						<TagDropdownMenu onClick={addTag} games={[props.runGame]}>
							<DropdownMenuTrigger
								as={Button<'button'>}
								variant="outline"
								size="sm"
								class={cn(
									'relative z-8 h-auto rounded-full bg-background px-2 py-1 text-xs text-black dark:text-white',
									props.addButtonClass,
								)}
							>
								<PlusIcon class="h-4 w-4" />
								Add Tag
							</DropdownMenuTrigger>
						</TagDropdownMenu>
					</li>
				</Show>
				<For each={runTags()}>
					{(tag) => (
						<li class="z-8 flex w-fit flex-row">
							<RunTag
								tag={tag}
								runId={props.runId}
								isOwn={props.isOwn}
								removeButtonClass={props.removeButtonClass}
							/>
						</li>
					)}
				</For>
				<Show when={addTagSubmission.pending}>
					<li>
						<Skeleton class="relative z-8 h-6 w-16 brightness-125" />
					</li>
				</Show>
			</ul>
		</div>
	);
};

export type TagDropdownMenuProps = {
	children: JSXElement;
	isTagDisabled?: (tag: Tag) => boolean;
	games?: GameId[];
} & (
	| {
			onClick: (tag: TagGroup | Tag | undefined) => void;
			showAllOptions: true;
	  }
	| {
			onClick: (tag: Tag) => void;
			showAllOptions?: false;
	  }
);

export const TagDropdownMenu: Component<TagDropdownMenuProps> = (props) => {
	function filterTags(tags: Tag[]) {
		if (!props.games) return tags;
		const filtered = tags.filter((tag) => tag.games.some((game) => props.games?.includes(game)));
		if (filtered.length === 0) {
			return null;
		}
		return filtered;
	}

	return (
		<DropdownMenu>
			{props.children}
			<DropdownMenuContent class="w-56">
				<Show when={props.showAllOptions}>
					<DropdownMenuItem onClick={() => props.onClick(undefined as never)}>
						<span>All</span>
					</DropdownMenuItem>
				</Show>
				<For each={tagGroups}>
					{(group) => (
						<Show when={filterTags(group.tagsNotRemoved)}>
							{(groupTags) => (
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>
										<span>{group.name}</span>
									</DropdownMenuSubTrigger>
									<DropdownMenuPortal>
										<DropdownMenuSubContent>
											<Show when={props.showAllOptions}>
												<DropdownMenuItem onClick={() => props.onClick(group as never)}>
													All {group.name}s
												</DropdownMenuItem>
											</Show>
											<For each={groupTags()}>
												{(tag) => (
													<DropdownMenuItem
														onClick={() => props.onClick(tag)}
														disabled={props.isTagDisabled?.(tag) ?? false}
													>
														<Badge class={tag.color.className}>{tag.name}</Badge>
													</DropdownMenuItem>
												)}
											</For>
										</DropdownMenuSubContent>
									</DropdownMenuPortal>
								</DropdownMenuSub>
							)}
						</Show>
					)}
				</For>
				<For each={filterTags(ungroupedTagsNotRemoved)}>
					{(tag) => (
						<DropdownMenuItem
							onClick={() => props.onClick(tag)}
							disabled={props.isTagDisabled?.(tag) ?? false}
						>
							<Badge class={tag.color.className}>{tag.name}</Badge>
						</DropdownMenuItem>
					)}
				</For>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
