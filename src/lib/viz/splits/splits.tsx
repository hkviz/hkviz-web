import { CircleQuestionMark, Search, X } from 'lucide-solid';
import { For, Show, createEffect, createSignal, createUniqueId, type Component } from 'solid-js';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Table, TableBody, TableCell, TableRow } from '~/components/ui/table';
import { TextField, TextFieldInput } from '~/components/ui/text-field';
import { cn } from '~/lib/utils';
import { SplitsList } from '~/routes/(docs)/guide/_analytics/_splits-list';
import { assertNever, recordingSplitGroups, type RecordingSplit, type RecordingSplitGroup } from '../../parser';
import { Duration } from '../duration';
import { useLayoutPanelContext } from '../layout/layout-panel-context';
import { LayoutPanelHeader } from '../layout/layout-panel-header';
import { LayoutPanelTypeProps } from '../layout/layout-panel-props';
import { LayoutPanelWrapper } from '../layout/layout-panel-wrapper';
import { useAnimationStore, useHoverMsStore, useRoomDisplayStore, useSplitsStore, useUiStore } from '../store';
import { splitColors } from './split-colors';

type RowActiveState = 'past' | 'next' | 'future';

interface RowProps {
	split: RecordingSplit;
	activeState: RowActiveState;
	scrollParent: HTMLDivElement | undefined;
}

const RunSplitRow: Component<RowProps> = (props) => {
	const animationStore = useAnimationStore();
	const roomDisplayStore = useRoomDisplayStore();
	const uiStore = useUiStore();
	const hoverMsStore = useHoverMsStore();
	// const activeStateClasses =
	//     activeState === 'past'
	//         ? 'bg-green-200 dark:bg-green-900'
	//         : activeState === 'next'
	//           ? 'bg-blue-300 dark:bg-blue-800'
	//           : activeState === 'future'
	//             ? ''
	//             : assertNever(activeState);

	const activeStateClasses = () =>
		props.activeState === 'past'
			? 'bg-linear-to-r from-green-300/10 to-green-500/20 dark:from-green-500/10 dark:to-green-500/15'
			: props.activeState === 'next'
				? 'bg-blue-300 dark:bg-blue-800'
				: props.activeState === 'future'
					? ''
					: assertNever(props.activeState);

	const hasClicked = {
		hasClicked: false,
		timeout: null as any,
	};

	function handleClick() {
		console.log('split clicked', props.split);
		animationStore.setMsIntoGame(props.split.msIntoGame, 'smooth');
		uiStore.showMapIfOverview();

		function markClicked() {
			clearTimeout(hasClicked.timeout);
			hasClicked.hasClicked = true;
			hasClicked.timeout = setTimeout(() => {
				hasClicked.hasClicked = false;
			}, 1000);
		}

		const sceneName = props.split.previousPlayerPositionEvent?.sceneEvent?.getMainVirtualSceneName?.();
		if (sceneName) {
			if (props.activeState !== 'next') {
				roomDisplayStore.setSelectedSceneName(sceneName);
				hasClicked.hasClicked = true;
				markClicked();
			} else {
				roomDisplayStore.togglePinnedRoom(sceneName, 'split-click');
				markClicked();
			}
		}
	}

	function handleMouseEnter() {
		const sceneName = props.split.previousPlayerPositionEvent?.sceneEvent?.getMainVirtualSceneName?.();
		if (sceneName) {
			roomDisplayStore.setHoveredRoom(sceneName, 'splits');
			roomDisplayStore.setSelectedRoomIfNotPinned(sceneName);
		}
		hoverMsStore.setHoveredMsIntoGame(props.split.msIntoGame);
	}

	function handleMouseLeave() {
		const sceneName = props.split.previousPlayerPositionEvent?.sceneEvent?.getMainVirtualSceneName?.();
		if (sceneName) {
			roomDisplayStore.unsetHoveredRoom(sceneName);
		}
		hoverMsStore.unsetHoveredMsIntoGame(props.split.msIntoGame);
	}

	const splitGroupColor = () => splitColors[props.split.group.name];

	let ref!: HTMLTableRowElement;

	createEffect(() => {
		if (props.activeState === 'next') {
			const tr = ref;
			const scrollDiv = props.scrollParent;
			if (!tr || !scrollDiv) return;
			const maxOk = tr.offsetTop;
			const minOk = tr.offsetTop - scrollDiv.clientHeight + tr.clientHeight;
			// (tr.parentNode! as any).scrollTop = tr.offsetTop;
			if (scrollDiv.scrollTop < minOk || scrollDiv.scrollTop > maxOk) {
				scrollDiv.scrollTo({ top: minOk, behavior: 'smooth' });
			}
		}
	});

	return (
		<TableRow ref={ref}>
			<TableCell class={cn('p-0', activeStateClasses())}>
				<button
					onClick={handleClick}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					class="relative flex w-full flex-row items-center gap-2 py-2.5 pr-3 pl-4"
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
							<Show when={props.activeState === 'next'}>
								<span class="absolute bottom-full left-0 text-[.5rem] font-bold opacity-75">
									Up Next
								</span>
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
				</button>
			</TableCell>
		</TableRow>
	);
};

const RunSplitsRows: Component = () => {
	const splitsStore = useSplitsStore();
	const filteredSplits = splitsStore.filteredSplits;
	const nextSplitIndex = splitsStore.nextSplitIndex;

	const [scrollDiv, setScrollDiv] = createSignal<HTMLDivElement>();

	return (
		<div class="shrink grow basis-0 overflow-y-auto" ref={setScrollDiv}>
			<Table class="w-full">
				<TableBody>
					<For each={filteredSplits()}>
						{(split, index) => {
							const activeState = () =>
								nextSplitIndex() === -1 || nextSplitIndex() === undefined
									? 'past'
									: nextSplitIndex() === index()
										? 'next'
										: index() < nextSplitIndex()
											? 'past'
											: 'future';
							return <RunSplitRow split={split} activeState={activeState()} scrollParent={scrollDiv()} />;
						}}
					</For>
				</TableBody>
			</Table>
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
				<Search class="absolute top-0 left-0 m-2.5 h-4 w-4" />
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
						<X class="h-4 w-4" />
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
							<CircleQuestionMark class="h-3 w-3" />
						</PopoverTrigger>
						<PopoverContent class="shadow-accent w-120 max-w-[90vw] p-0">
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
