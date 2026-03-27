import { ArrowLeftIcon, ArrowRightIcon, PaletteIcon, PinIcon, PinOffIcon } from 'lucide-solid';
import { createEffect, createMemo, For, Index, Match, onCleanup, Show, Switch, type Component } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { ShortcutHint } from '~/components/shortcut-hint';
import { tabsListTransparentClasses } from '~/components/ui/additions';
import {
	SelectItemBody,
	SelectItemDescription,
	SelectItemHeader,
	selectItemIconClasses,
} from '~/components/ui/additions/select';
import { Button } from '~/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '~/components/ui/context-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableRow } from '~/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Toggle } from '~/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { cn } from '~/lib/utils';
import {
	allRoomDataIncludingSubspritesBySceneName,
	getRelatedVirtualRoomNames,
	mainRoomDataBySceneName,
	RelatedVirtualRoom,
} from '../../parser';
import { roomInfoColoringToggleClasses } from '../class-names';
import { useLayoutPanelContext } from '../layout/layout-panel-context';
import { LayoutPanelTypeProps } from '../layout/layout-panel-props';
import { LayoutPanelSelect } from '../layout/layout-panel-select';
import { LayoutPanelWrapper } from '../layout/layout-panel-wrapper';
import { HKMapRoom } from '../map/room-icon';
import {
	AggregationCountMode,
	aggregationCountModes,
	AreaSelectionMode,
	getAggregationCountModeDescription,
	getAggregationCountModeIcon,
	getAggregationCountModeLabel,
	useAggregationStore,
	useAnimationStore,
	useRoomColoringStore,
	useRoomDisplayStore,
	useThemeStore,
	useUiStore,
} from '../store';
import {
	AggregationVariable,
	aggregationVariableInfos,
	aggregationVariables,
	formatAggregatedVariableValue,
} from '../store/aggregations/aggregate-recording';
import { createRoomMsButtonProps } from '../util/shared-interactions';
import { AggregationVariableIcon } from './aggregation-variable-icon';
import { AreaAnalyticsContext, createAreaAnalyticsContext, useAreaAnalyticsContext } from './area-analytics-context';
import { AreaAnalyticsVariableHistory } from './area-analytics-variable-history';
import { RoomColorCurveContextMenuItems } from './room-color-curve-menu';

function AggregationVariableToggles(props: { variable: AggregationVariable }) {
	const roomColoringStore = useRoomColoringStore();
	const roomColors = roomColoringStore.colorMode;
	const roomColorVar1 = roomColoringStore.var1;
	const roomColorVar1Curve = roomColoringStore.var1Curve;
	const uiStore = useUiStore();

	const isActive = () => roomColors() === '1-var' && roomColorVar1() === props.variable;

	// const showVar1 = roomColors === '1-var';

	return (
		<TableCell class="w-1 p-0">
			<ContextMenu>
				<ContextMenuTrigger
					as={Toggle}
					variant="outline"
					pressed={isActive()}
					onChange={() => {
						roomColoringStore.cycleRoomColorVar1(props.variable);
						uiStore.showMapIfOverview();
					}}
					class={
						'relative mt-1 h-8.5 w-8.5 rounded-full ' +
						(!isActive()
							? ''
							: roomColorVar1Curve().type === 'linear'
								? 'bg-primary text-white'
								: roomColorVar1Curve().type === 'log'
									? 'bg-blue-600 text-white'
									: roomColorVar1Curve().type === 'exponential'
										? 'bg-green-600 text-white'
										: '') +
						' ' +
						roomInfoColoringToggleClasses(props.variable)
					}
				>
					<span class="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
						<Switch>
							<Match when={!isActive()}>
								<PaletteIcon class="h-4 w-4 text-base" />
							</Match>
							<Match when={isActive() && roomColorVar1Curve().type === 'linear'}>
								<span class="text-[.7rem]">linear</span>
							</Match>
							<Match when={isActive() && roomColorVar1Curve().type === 'log'}>
								<span>log</span>
							</Match>
							<Match when={isActive() && roomColorVar1Curve().type === 'exponential'}>
								<span>exp</span>
							</Match>
						</Switch>
					</span>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<RoomColorCurveContextMenuItems variable={props.variable} />
				</ContextMenuContent>
			</ContextMenu>
		</TableCell>
	);
}

const AggregationVariableRow: Component<{
	variable: AggregationVariable;
	selectVariable?: (variable: AggregationVariable) => void;
	deselectVariable?: () => void;
}> = (props) => {
	const animationStore = useAnimationStore();
	const roomDisplayStore = useRoomDisplayStore();
	const aggregationStore = useAggregationStore();
	const selectedRoom = roomDisplayStore.selectedSceneName;
	const aggregatedVariableValue = createMemo(() => {
		return aggregationStore.getCorrectedAggregationValue(
			aggregationStore.visibleRoomAggregations(),
			props.variable,
			animationStore.msIntoGame,
		);
	});
	const formatted = createMemo(() => {
		return formatAggregatedVariableValue(props.variable, aggregatedVariableValue());
	});
	const variableInfo = createMemo(() => aggregationVariableInfos[props.variable]);

	const hover = createRoomMsButtonProps({
		time: () => ({ msIntoGame: variableInfo().isTimestamp ? aggregatedVariableValue() : undefined }),
	});

	return (
		<Show when={selectedRoom()}>
			<TableRow>
				<Show when={props.deselectVariable}>
					<TableCell class="w-0 p-0">
						<Tooltip>
							<TooltipTrigger
								as={Button}
								size="icon"
								variant="ghost"
								class="-mr-3 h-10 w-7"
								onClick={() => props.deselectVariable?.()}
							>
								<ArrowLeftIcon class="h-3 w-3" />
							</TooltipTrigger>
							<TooltipContent>Back to variable list</TooltipContent>
						</Tooltip>
					</TableCell>
				</Show>
				<TableHead class="flex h-11.5 items-center p-1 pl-3">
					<Tooltip>
						<TooltipTrigger>
							<div class="flex flex-row items-center justify-center gap-2">
								<AggregationVariableIcon variable={props.variable} />
								<span>{variableInfo().name}</span>
							</div>
						</TooltipTrigger>
						<TooltipContent>{variableInfo().description}</TooltipContent>
					</Tooltip>
				</TableHead>
				<TableCell class="w-1 p-1 pr-3 text-right">
					<div class="flex items-center justify-end">
						<Show when={variableInfo().isTimestamp} fallback={formatted()}>
							<Button
								variant="ghost"
								class="-m-2 p-2"
								onClick={() => {
									const value = aggregatedVariableValue();
									if (value !== null) {
										animationStore.setMsIntoGame(value, 'smooth');
									}
								}}
								{...hover}
							>
								{formatted()}
							</Button>
						</Show>
					</div>
				</TableCell>
				<AggregationVariableToggles variable={props.variable} />
				<TableCell class="w-0 p-0">
					<Show when={props.selectVariable}>
						<Tooltip>
							<TooltipTrigger
								as={Button}
								size="icon"
								variant="ghost"
								class="h-10 w-7"
								onClick={() => props.selectVariable?.(props.variable)}
							>
								<ArrowRightIcon class="h-3 w-3" />
							</TooltipTrigger>
							<TooltipContent>Show history</TooltipContent>
						</Tooltip>
					</Show>
				</TableCell>
			</TableRow>
		</Show>
	);
};

function AggregationVariables() {
	const aggregationStore = useAggregationStore();
	const roomInfosContext = useAreaAnalyticsContext();
	const aggregatedMaxOverScenes = () => aggregationStore.data()?.maxPerMode.overScenes;
	const viewNeverHappenedAggregations = aggregationStore.viewNeverHappenedAggregations;

	const neverHappenedEvents = createMemo(() =>
		aggregationVariables.filter((variable) => !aggregatedMaxOverScenes()?.[variable]),
	);

	const displayedVariables = createMemo(() =>
		aggregationVariables.filter((it) => viewNeverHappenedAggregations() || !neverHappenedEvents().includes(it)),
	);

	return (
		<div class="shrink grow basis-0 overflow-y-auto">
			<Table class="w-full">
				<TableBody>
					<For each={displayedVariables()}>
						{(variable) => (
							<AggregationVariableRow
								variable={variable}
								selectVariable={roomInfosContext.selectVariable}
							/>
						)}
					</For>
					<Show when={neverHappenedEvents().length !== 0}>
						<TableRow>
							<TableCell colSpan={3} class="text-center">
								<Show when={viewNeverHappenedAggregations()}>
									<p class="flex flex-col items-center">
										<Button
											class="h-fit"
											variant="outline"
											onClick={() => {
												aggregationStore.setViewNeverHappenedAggregations(false);
											}}
										>
											Hide never occurred events
										</Button>
									</p>
								</Show>
								<Show when={!viewNeverHappenedAggregations()}>
									<p class="flex h-fit flex-col items-center">
										<Button
											class="h-fit"
											variant="outline"
											onClick={() => {
												aggregationStore.setViewNeverHappenedAggregations(true);
											}}
										>
											Show never occurred events (Spoilers)
										</Button>
									</p>
								</Show>
							</TableCell>
						</TableRow>
					</Show>
				</TableBody>
			</Table>
		</div>
	);
}

function RelatedRoomsTab(props: { room: RelatedVirtualRoom; ref: (el: HTMLButtonElement | null) => void }) {
	const roomColoringStore = useRoomColoringStore();
	const roomColor = createMemo(() => {
		return roomColoringStore.getSingleVarColorForSceneName(props.room.name);
	});

	onCleanup(() => {
		props.ref(null);
	});

	const hover = createRoomMsButtonProps({
		room: () => ({ sceneName: props.room.name, hoverSource: 'other', selectIfNotPinned: false }),
	});

	return (
		<TabsTrigger
			value={props.room.name}
			ref={props.ref}
			class={'border-t bg-linear-to-b from-transparent to-transparent data-selected:border'}
			style={{
				'border-color': roomColor() ?? 'transparent',
				'--tw-gradient-from': 'color-mix(in hsl, ' + (roomColor() ?? 'transparent') + ' 20%, transparent)',
			}}
			{...hover}
		>
			{props.room.displayName}
		</TabsTrigger>
	);
}

function RelatedRoomsTabs(props: {
	selectedRoom: string | null;
	relatedRooms: Array<RelatedVirtualRoom>;
	onChange: (tab: string) => void;
}) {
	let tabsViewportRef: HTMLDivElement | undefined;
	const triggerRefs = new Map<string, HTMLButtonElement>();

	createEffect(() => {
		const selected = props.selectedRoom;
		const _related = props.relatedRooms;
		if (!selected || !tabsViewportRef) return;

		queueMicrotask(() => {
			if (!tabsViewportRef) return;
			const trigger = triggerRefs.get(selected);
			if (!trigger) return;

			const viewportRect = tabsViewportRef.getBoundingClientRect();
			const triggerRect = trigger.getBoundingClientRect();
			const isFullyVisible =
				triggerRect.left >= viewportRect.left + 1 && triggerRect.right <= viewportRect.right - 1;

			if (isFullyVisible) return;
			trigger.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
		});
	});

	return (
		<Show when={props.relatedRooms.length !== 0}>
			<Tabs
				value={props.selectedRoom ?? undefined}
				class="max-w-full overflow-x-auto overflow-y-hidden"
				onChange={props.onChange}
				ref={tabsViewportRef}
			>
				<TabsList class={cn(tabsListTransparentClasses, 'from')}>
					<Index each={props.relatedRooms}>
						{(room) => (
							<RelatedRoomsTab
								room={room()}
								ref={(el) => {
									if (el) {
										triggerRefs.set(room().name, el);
									} else {
										triggerRefs.delete(room().name);
									}
								}}
							/>
						)}
					</Index>
				</TabsList>
			</Tabs>
		</Show>
	);
}

export function AreaAnalyticsPanel(_props: LayoutPanelTypeProps) {
	const roomDisplayStore = useRoomDisplayStore();
	const aggregationStore = useAggregationStore();
	const panelContext = useLayoutPanelContext();
	const themeStore = useThemeStore();

	const selectedRoom = roomDisplayStore.selectedSceneName;
	const selectedRoomPinned = roomDisplayStore.selectedScenePinned;
	const areaSelectionMode = roomDisplayStore.areaSelectionMode;

	const roomInfos = createMemo(() => {
		const _selectedRoom = selectedRoom();
		const mainRoomInfo = _selectedRoom ? (mainRoomDataBySceneName.get(_selectedRoom) ?? null) : null;
		const allRoomInfosIncludingSubsprites = mainRoomInfo
			? (allRoomDataIncludingSubspritesBySceneName.get(mainRoomInfo.sceneName) ?? null)
			: null;
		return { mainRoomInfo, allRoomInfosIncludingSubsprites };
	});

	const theme = themeStore.currentTheme;

	const gradientColor = createMemo(() => {
		const color = roomInfos().mainRoomInfo?.color;
		if (!color) {
			return 'transparent';
		}
		if (theme() === 'light') {
			return color.copy({ opacity: 0.2 }).toString();
		} else {
			return color.copy({ opacity: 0.1 }).toString();
		}
	});

	const relatedRooms = createMemo(() => {
		const mapZone = roomInfos().mainRoomInfo?.mapZone;
		const _selectedRoom = selectedRoom();
		if (!_selectedRoom || !mapZone) return [];
		return getRelatedVirtualRoomNames(mapZone, _selectedRoom);
	});

	const roomInfosContext = createAreaAnalyticsContext();

	return (
		<AreaAnalyticsContext.Provider value={roomInfosContext}>
			<LayoutPanelWrapper
				class="room-infos-card before:bg-card relative flex min-h-22 min-w-75 shrink grow basis-0 flex-col border-t border-l bg-linear-to-b from-transparent to-transparent before:absolute before:inset-0 before:-z-10 before:h-full before:w-full before:rounded-lg max-lg:basis-0 before:max-lg:rounded-none"
				style={{
					'--tw-gradient-from': gradientColor(),
					transition: '--tw-gradient-from .25s ease-in-out',
				}}
			>
				<CardHeader class="flex flex-row items-center p-2 pt-2">
					<Show when={areaSelectionMode() === 'room' && roomInfos().allRoomInfosIncludingSubsprites}>
						{(allRoomDataIncludingSubspritesBySceneName) => (
							<HKMapRoom roomInfos={allRoomDataIncludingSubspritesBySceneName()} class="mr-2 h-12 w-12" />
						)}
					</Show>

					<div>
						<CardTitle class="text-base md:text-lg">
							<Show
								when={selectedRoom() == null}
								fallback={
									<Tooltip>
										<TooltipTrigger class="text-left leading-[1.15]">
											{areaSelectionMode() === 'all'
												? 'All Areas'
												: (roomInfos().mainRoomInfo?.zoneNameFormatted ?? 'Unknown Area')}
										</TooltipTrigger>
										<TooltipContent>Area</TooltipContent>
									</Tooltip>
								}
							>
								Area Analytics
							</Show>
						</CardTitle>
						<CardDescription>
							<Show when={selectedRoom() == null}>
								<span class="text-sm opacity-50">
									Hover or click a room on the map to view analytics
								</span>
							</Show>
							<Show when={selectedRoom() != null}>
								<Tooltip>
									<TooltipTrigger class="text-left">
										{areaSelectionMode() === 'room'
											? (roomInfos().mainRoomInfo?.roomNameFormattedZoneExclusive ??
												selectedRoom())
											: 'All Rooms'}
										{/* <br />
                                    {selectedRoom} */}
									</TooltipTrigger>
									<TooltipContent>Room</TooltipContent>
								</Tooltip>
							</Show>
						</CardDescription>
					</div>

					<div class="grow" />

					<div class="-ml-3">
						<LayoutPanelSelect iconOnly={true} />
					</div>

					<Tooltip>
						<TooltipTrigger
							as={Button}
							variant="outline"
							size="icon"
							onClick={() => {
								if (selectedRoomPinned()) {
									roomDisplayStore.unpinScene('pin-button-click');
								} else {
									roomDisplayStore.pinScene('pin-button-click');
								}
							}}
							class={
								'room-info-pin-button h-8 w-8 shrink-0 ' +
								(selectedRoomPinned()
									? 'bg-black/20 hover:bg-black/30 dark:bg-white/20 hover:dark:bg-white/30'
									: '')
							}
						>
							<Show when={selectedRoomPinned()} fallback={<PinIcon class="h-4 w-4" />}>
								<PinOffIcon class={'h-4 w-4'} />
							</Show>
						</TooltipTrigger>
						<TooltipContent>
							<Show when={selectedRoomPinned()}>
								Remove pin. Will automatically select the room when you hover over it. <br />
								You can also click a room on the map to pin/unpin it.
							</Show>
							<Show when={!selectedRoomPinned()}>
								Pin room. Will not change the selected room when you hover over the map and other
								charts.
								<br />
								You can also click a room on the map to pin/unpin it.
							</Show>
							<ShortcutHint keys="P" before="Or press" after="to toggle pinning the selected room" />
						</TooltipContent>
					</Tooltip>
				</CardHeader>
				<Show when={!panelContext.isCollapsed()}>
					<CardContent class="flex shrink grow basis-0 flex-col p-0">
						<Show when={selectedRoom() != null}>
							<div class="mx-2 mt-0 mb-1 flex items-center justify-between">
								<ToggleGroup
									class="gap-0"
									value={roomDisplayStore.areaSelectionMode()}
									onChange={(v) =>
										roomDisplayStore.setAreaSelectionMode((v as AreaSelectionMode) ?? 'room')
									}
								>
									<Tooltip>
										<TooltipTrigger as={ToggleGroupItem} value="all">
											All
										</TooltipTrigger>
										<TooltipContent>
											Analytics over all rooms together
											<ShortcutHint
												before="Press"
												keys="A"
												after="to cycle area selection mode"
											/>
										</TooltipContent>
									</Tooltip>
									<Tooltip>
										<TooltipTrigger as={ToggleGroupItem} value="zone">
											Area
										</TooltipTrigger>
										<TooltipContent>
											Analytics aggregated by area (e.g. City of Tears)
											<ShortcutHint
												before="Press"
												keys="A"
												after="to cycle area selection mode"
											/>
										</TooltipContent>
									</Tooltip>
									<Tooltip>
										<TooltipTrigger as={ToggleGroupItem} value="room">
											Room
										</TooltipTrigger>
										<TooltipContent>
											Analytics for each individual room
											<ShortcutHint
												before="Press"
												keys="A"
												after="to cycle area selection mode"
											/>
										</TooltipContent>
									</Tooltip>
								</ToggleGroup>
								<Select
									value={aggregationStore.aggregationCountMode()}
									onChange={(v) => {
										if (!v) return;
										aggregationStore.setAggregationCountMode(v);
									}}
									options={aggregationCountModes}
									placeholder="Aggregation mode"
									itemComponent={(props) => (
										<SelectItem item={props.item}>
											<SelectItemBody>
												<SelectItemHeader>
													<Dynamic
														component={getAggregationCountModeIcon(props.item.rawValue)}
														class={selectItemIconClasses}
													/>
													{getAggregationCountModeLabel(props.item.rawValue)}
												</SelectItemHeader>
												<SelectItemDescription>
													{getAggregationCountModeDescription(props.item.rawValue)}
												</SelectItemDescription>
											</SelectItemBody>
										</SelectItem>
									)}
								>
									<SelectTrigger aria-label="Trace visibility">
										<SelectValue<AggregationCountMode>>
											{(state) => getAggregationCountModeLabel(state.selectedOption())}
										</SelectValue>
									</SelectTrigger>
									<SelectContent />
								</Select>
							</div>
							{/* keys since should scrolling reset between scenes */}
							<Show
								when={
									roomDisplayStore.areaSelectionMode() === 'room' &&
									roomInfos().mainRoomInfo?.sceneName
								}
								keyed
							>
								<RelatedRoomsTabs
									selectedRoom={selectedRoom()}
									relatedRooms={relatedRooms()}
									onChange={(tab) => {
										roomDisplayStore.setSelectedSceneName(tab);
									}}
								/>
							</Show>
							<Show when={roomInfosContext.selectedVariable()} fallback={<AggregationVariables />}>
								{(variable) => (
									<>
										<Table>
											<TableBody>
												<AggregationVariableRow
													variable={variable()}
													deselectVariable={() => roomInfosContext.deselectVariable()}
												/>
											</TableBody>
										</Table>
										<AreaAnalyticsVariableHistory />
									</>
								)}
							</Show>
						</Show>
					</CardContent>
				</Show>
			</LayoutPanelWrapper>
		</AreaAnalyticsContext.Provider>
	);
}
