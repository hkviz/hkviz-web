import { CircleQuestionMarkIcon, SearchIcon, XIcon } from 'lucide-solid';
import { For, Show, createUniqueId, type Component } from 'solid-js';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { TextField, TextFieldInput } from '~/components/ui/text-field';
import {
	RecordingSplit,
	RecordingSplitGroup,
	recordingSplitGroups,
} from '~/lib/parser/recording-files/parser-hollow/recording-splits';
import { cn } from '~/lib/utils';
import { SplitsList } from '~/routes/(docs)/guide/_analytics/_splits-list';
import { Duration } from '../duration';
import { useLayoutPanelContext } from '../layout/layout-panel-context';
import { LayoutPanelHeader } from '../layout/layout-panel-header';
import { LayoutPanelTypeProps } from '../layout/layout-panel-props';
import { LayoutPanelWrapper } from '../layout/layout-panel-wrapper';
import { useSplitsStore } from '../store';
import { TimelineList, TimelineListEntryButton, useTimelineListEntryContext } from '../timeline-list/timeline-list';
import { splitColors } from './split-colors';

interface RowProps {
	split: RecordingSplit;
}

const RunSplitRow: Component<RowProps> = (props) => {
	const timelineListContext = useTimelineListEntryContext();
	const splitGroupColor = () => splitColors[props.split.group.name];

	return (
		<TimelineListEntryButton
			class="flex w-full flex-row items-center justify-between gap-2 py-2.5 pr-3 pl-4 text-sm"
			heightMode="auto"
		>
			<div class={cn('absolute top-0 bottom-0 left-0 w-1', splitGroupColor().background)} />
			<Show when={props.split.imageUrl}>
				{(imageUrl) => (
					<div
						class="mr-2 h-7 w-7 shrink-0 bg-contain bg-center bg-no-repeat"
						style={{
							['background-image']: `url(${imageUrl()})`,
						}}
					/>
				)}
			</Show>
			<p class="flex grow flex-col items-start justify-center text-left">
				<span class="relative">
					<Show when={timelineListContext.state() === 'next'}>
						<span class="absolute bottom-full left-0 w-max text-[.5rem] font-bold opacity-75">Up Next</span>
					</Show>
					{props.split.title}
				</span>
				{/* <span
                            class="-mb-1 mt-1 rounded-lg bg-slate-400 px-1 py-0.5 text-[.5rem] font-bold leading-none text-black"
                            style={{ backgroundColor: scene?.color?.formatHex() }}
                        >
                            {displaySceneName}
                        </span> */}
				{/* <span class="-mb-1 rounded-lg py-0.5 text-[.6rem] font-bold leading-none" style={{ color }}>
                            {displaySceneName}
                        </span> */}
			</p>
			<Duration ms={props.split.msIntoGame} class="pr-3" withTooltip={false} />
		</TimelineListEntryButton>
	);
};

const RunSplitsRows: Component = () => {
	const splitsStore = useSplitsStore();
	const filteredSplits = splitsStore.filteredSplits;

	function getSceneName(entry: RecordingSplit) {
		const newScene = entry.previousPlayerPositionEvent?.sceneEvent?.getMainVirtualSceneName?.();
		return newScene;
	}

	return (
		<div class="relative flex shrink grow basis-0 flex-col">
			<TimelineList
				entries={filteredSplits()}
				getEntryTime={(entry) => entry.msIntoGame}
				getSceneName={getSceneName}
				virtualize={false}
			>
				{(split, _state, _previousEntry) => <RunSplitRow split={split()} />}
			</TimelineList>
		</div>
	);
};

const RunSplitsSearch: Component = () => {
	const splitsStore = useSplitsStore();
	const filterTerm = splitsStore.filterTerm;
	const panelContext = useLayoutPanelContext();

	return (
		<div class="relative mr-2 shrink grow">
			<Show when={!panelContext.isCollapsed()}>
				<SearchIcon class="absolute top-0 left-0 m-2.5 h-4 w-4" />
				<TextField>
					<TextFieldInput
						type="text"
						value={filterTerm()}
						onInput={(e) => splitsStore.setFilterTerm((e.target as HTMLInputElement).value)}
						placeholder="Search"
						class="h-9 shrink grow px-8"
					/>
				</TextField>
				<Show when={filterTerm()}>
					<Button
						onClick={() => splitsStore.setFilterTerm('')}
						class="absolute top-0 right-0 flex h-9 w-9 items-center justify-center p-0"
						variant="ghost"
						title="Clear search"
					>
						<XIcon class="h-4 w-4" />
					</Button>
				</Show>
			</Show>
		</div>
	);
};

export const RunSplits: Component<LayoutPanelTypeProps> = (props) => {
	const id = createUniqueId();
	const splitsStore = useSplitsStore();
	const visibleSplitGroups = splitsStore.visibleSplitGroups;
	const panelContext = useLayoutPanelContext();

	const setVisibleSplitGroupChecked = (group: RecordingSplitGroup, checked: boolean) => {
		const currentGroup = splitsStore.visibleSplitGroups();
		splitsStore.setVisibleSplitGroups(checked ? [...currentGroup, group] : currentGroup.filter((g) => g !== group));
	};

	return (
		<LayoutPanelWrapper>
			<div class="run-splits flex h-full flex-col">
				<LayoutPanelHeader resizeOptions={props.resizeOptions}>
					<RunSplitsSearch />
					<Popover>
						<PopoverTrigger
							as={Button}
							variant="ghost"
							size="icon"
							class="h-7 w-7 shrink-0"
							aria-label="Splits help"
						>
							<CircleQuestionMarkIcon class="h-3 w-3" />
						</PopoverTrigger>
						<PopoverContent class="w-120 max-w-[90vw] p-0 shadow-accent">
							<div class="text-sm">
								<SplitsList />
							</div>
							<a href="/guide/analytics#splits" class="m-4 block text-sm underline" target="_blank">
								Learn more
							</a>
						</PopoverContent>
					</Popover>
				</LayoutPanelHeader>
				<Show when={!panelContext.isCollapsed()}>
					<div class="flex flex-wrap gap-1 p-3 pt-0">
						<For each={recordingSplitGroups}>
							{(group) => {
								const checked = () => visibleSplitGroups().includes(group);
								const color = splitColors[group.name];
								return (
									<div class="flex flex-row">
										<Checkbox
											id={id + '_run_split_option_' + group.name}
											checked={checked()}
											onChange={(checked) =>
												setVisibleSplitGroupChecked(group, checked as boolean)
											}
											controlClass={color.checkboxSolid}
										/>
										<label
											for={id + '_run_split_option_' + group.name + '-input'}
											class="grow pl-1 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											{group.displayName}
										</label>
									</div>
								);
							}}
						</For>
					</div>

					<hr />
					<RunSplitsRows />
				</Show>
			</div>
		</LayoutPanelWrapper>
	);
};
