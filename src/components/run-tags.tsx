import { useAction, useSubmission } from '@solidjs/router';
import { Plus, X } from 'lucide-solid';
import { For, Show, createMemo, createSignal, type Component, type JSXElement } from 'solid-js';
import { tagFromCode, tagGroups, ungroupedTags, type Tag, type TagCode, type TagGroup } from '~/lib/types/tags';
import { cn } from '~/lib/utils';
import { addTagAction, removeTagAction } from '~/server/run/tags';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';

// TODO
export const RunTag: Component<{
	tag: Tag;
	runId: string;
	isOwn: boolean;
	onRemovedTag?: (tag: Tag) => void;
	removeButtonClass?: string;
}> = (props) => {
	const _removeTag = useAction(removeTagAction);
	const removeTagSubmission = useSubmission(
		removeTagAction,
		([runId, code]) => runId === props.runId && code === props.tag.code,
	);

	async function removeTag() {
		console.log('removeTag', props.tag.code);
		await _removeTag(props.runId, props.tag.code);
		props.onRemovedTag?.(props.tag);
	}

	return (
		<Badge
			class={cn(
				'relative z-[8] overflow-hidden',
				props.tag.color.className,
				removeTagSubmission.pending ? 'bg-zinc-700 hover:bg-zinc-700' : '',
			)}
		>
			<span class="font-bold">{props.tag.name}</span>
			<Show when={props.isOwn}>
				<Button
					variant="ghost"
					class={cn('relative -m-2 -mr-3 ml-0 h-8 w-8 rounded-full', props.removeButtonClass)}
					size="icon"
					onClick={removeTag}
					disabled={removeTagSubmission.pending || !!removeTagSubmission.result}
				>
					<X class="h-3 w-3" />
				</Button>
			</Show>
		</Badge>
	);
};

export const RunTags: Component<{
	codes: TagCode[];
	runId: string;
	isOwn: boolean;
	class?: string;
	addButtonClass?: string;
	removeButtonClass?: string;
}> = (props) => {
	const [codes, setCodes] = createSignal<TagCode[]>(props.codes);
	const runTags = createMemo(() =>
		codes()
			.map(tagFromCode)
			.sort((a, b) => a.order - b.order),
	);

	createSignal(() => {
		setCodes(props.codes);
	});

	const _addTag = useAction(addTagAction);
	const addTagSubmission = useSubmission(addTagAction, ([runId]) => runId === props.runId);

	async function addTag(tag: Tag) {
		if (codes().includes(tag.code)) return;
		await _addTag(props.runId, tag.code);
		setCodes([...codes(), tag.code]);
	}

	function onRemovedTag(tag: Tag) {
		setCodes(codes().filter((code) => code !== tag.code));
	}

	return (
		<div class={cn('items-[start] flex min-h-6 flex-row flex-wrap gap-1 font-sans', props.class)}>
			<ul class="flex flex-row flex-wrap-reverse items-end justify-end gap-1">
				<Show when={props.isOwn}>
					<li>
						<TagDropdownMenu onClick={addTag}>
							<DropdownMenuTrigger
								as={Button<'button'>}
								variant="outline"
								size="sm"
								class={cn(
									'relative z-[8] h-auto rounded-full bg-background px-2 py-1 text-xs text-black dark:text-white',
									props.addButtonClass,
								)}
							>
								<Plus class="h-4 w-4" />
								Add Tag
							</DropdownMenuTrigger>
						</TagDropdownMenu>
					</li>
				</Show>
				<For each={runTags()}>
					{(tag) => (
						<li class="flex w-fit flex-row">
							<RunTag
								tag={tag}
								runId={props.runId}
								isOwn={props.isOwn}
								onRemovedTag={onRemovedTag}
								removeButtonClass={props.removeButtonClass}
							/>
						</li>
					)}
				</For>
				<Show when={addTagSubmission.pending}>
					<li>
						<Skeleton class="relative z-[8] h-6 w-[4rem] brightness-125" />
					</li>
				</Show>
			</ul>
		</div>
	);
};

export type TagDropdownMenuProps = {
	children: JSXElement;
	isTagDisabled?: (tag: Tag) => boolean;
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
									<For each={group.tags}>
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
				</For>
				<For each={ungroupedTags}>
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
