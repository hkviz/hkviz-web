import { Maximize, Minus, Rows } from 'lucide-solid';
import { For, JSXElement, Show, createEffect, createSignal, type Component } from 'solid-js';
import { cardRoundedMdOnlyClasses } from '~/components/ui/additions';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Resizable, ResizableHandle } from '~/components/ui/resizable';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { cn } from '~/lib/utils';
import { LaneId } from '../layout/layout-location';
import { LayoutPanel } from '../layout/layout-panel';
import { RunFileInfo, RunFileLoader } from '../loader';
import { HKMap } from '../map';
import { useUiStore, useViewportStore } from '../store';
import { useLayoutStore } from '../store/layout-store';
import { AnimationOptions } from '../timeline';
import { SingleRunPageTour } from '../tour';
import { MobileTabBar } from './mobile-tabs';
import { RunOverviewTab } from './overview-tab';
import { LargeScreenTabs } from './tabs-large-screen';

export const DashboardMapOptions: Component = () => {
	const uiStore = useUiStore();
	const mobileTab = uiStore.mobileTab;
	return (
		<LayoutLane
			lane="left"
			class={cn('dashboard-grid-map-options hidden', mobileTab() === 'map' ? 'md:flex' : 'lg:flex')}
		/>
	);
};

interface ResizeButtonsProps {
	state: 'minimized' | 'medimized' | 'maximized';
	minimize: () => void;
	medimize: () => void;
	maximize: () => void;
}
const ResizeButtons: Component<ResizeButtonsProps> = (props) => {
	return (
		<div class="-ml-3 inline-block shrink-0 pl-1">
			<Show when={props.state !== 'minimized'}>
				<Tooltip>
					<TooltipTrigger
						as={() => (
							<Button variant="ghost" size="icon" class="h-7 w-7" onClick={props.minimize}>
								<Minus class="h-3 w-3" />
							</Button>
						)}
					/>
					<TooltipContent>Close</TooltipContent>
				</Tooltip>
			</Show>
			<Show when={props.state !== 'medimized'}>
				<Tooltip>
					<TooltipTrigger
						as={() => (
							<Button variant="ghost" size="icon" class="h-7 w-7" onClick={props.medimize}>
								<Rows class="h-3 w-3" />
							</Button>
						)}
					/>
					<TooltipContent>Show splits & time-based charts</TooltipContent>
				</Tooltip>
			</Show>
			<Show when={props.state !== 'maximized'}>
				<Tooltip>
					<TooltipTrigger
						as={() => (
							<Button variant="ghost" size="icon" class="h-7 w-7" onClick={props.maximize}>
								<Maximize class="h-3 w-3" />
							</Button>
						)}
					/>
					<TooltipContent>Maximize</TooltipContent>
				</Tooltip>
			</Show>
		</div>
	);
};

export const LayoutLane: Component<{ class?: string; lane: LaneId }> = (props) => {
	const uiStore = useUiStore();
	const layoutStore = useLayoutStore();
	const mobileTab = uiStore.mobileTab;

	//createEffect(() => {
	//const state = layoutState();
	// todo move to somewhere
	//splitsStore.setIsSplitsPanelOpen(state === 'only-splits' || state === 'both');
	//});

	const lanePanels = () => layoutStore.getLaneLocationIds(props.lane);
	const sizes = () => layoutStore.getLaneSizes(props.lane);
	const setSizes = (newSizes: number[]) => layoutStore.setLaneSizes(props.lane, newSizes);

	function resizeOptions(index: number) {
		return (
			<ResizeButtons
				state={sizes()[index] < 0.1 ? 'minimized' : sizes()[index] >= 0.9 ? 'maximized' : 'medimized'}
				minimize={() => layoutStore.minimizePanel(props.lane, index)}
				medimize={() => layoutStore.medimizePanel(props.lane, index)}
				maximize={() => layoutStore.maximizePanel(props.lane, index)}
			/>
		);
	}

	return (
		<div class={cn('shrink grow', props.class)}>
			<Resizable orientation="vertical" sizes={sizes()} onSizesChange={setSizes}>
				<For each={lanePanels()}>
					{(_panel, index) => (
						<>
							<Show when={index() !== 0}>
								<ResizableHandle withHandle class="bg-transparent p-1" />
							</Show>
							<LayoutPanel
								layoutLane={props.lane}
								layoutLaneIndex={index()}
								resizeOptions={resizeOptions(index())}
								isCollapsed={sizes()[index()] < 0.1}
							/>
						</>
					)}
				</For>
			</Resizable>
		</div>
	);
};

export const RightCard: Component<{ class?: string }> = (props) => {
	const uiStore = useUiStore();
	const mobileTab = uiStore.mobileTab;
	return <LayoutLane class={cn(mobileTab() === 'right' ? 'flex' : 'hidden lg:flex', props.class)} lane="right" />;
};

export interface GameplayDashboardProps {
	fileInfos: RunFileInfo[];
	startDate: Date | undefined;
	gameplayCard: JSXElement;
	runFileLoader: RunFileLoader;
}
export const GameplayDashboard: Component<GameplayDashboardProps> = (props) => {
	const uiStore = useUiStore();
	const mobileTab = uiStore.mobileTab;
	const viewportStore = useViewportStore();
	const isSmallMobileLayout = viewportStore.isSmallMobileLayout;

	const [showMap, setShowMap] = createSignal(false);

	createEffect(() => {
		setShowMap(true);
	});

	return (
		<div class="dashboard-grid">
			<Show when={isSmallMobileLayout()}>
				<LayoutLane
					lane="mobileMap"
					class={cn(
						'dashboard-grid-mobile-map-lane max-w-[100vw] md:hidden',
						mobileTab() === 'map' ? '' : 'hidden',
					)}
				/>
			</Show>
			<DashboardMapOptions />
			<Card
				class={cn(
					cardRoundedMdOnlyClasses,
					'relative grow grid-cols-1 grid-rows-1 overflow-hidden border-t',
					mobileTab() === 'overview' ? 'dashboard-grid-map-big' : 'dashboard-grid-map',
					mobileTab() === 'overview' ? 'grid' : mobileTab() === 'map' ? 'hidden md:grid' : 'hidden lg:grid',
				)}
			>
				<LargeScreenTabs />
				<Show when={showMap() && !isSmallMobileLayout()}>
					<HKMap class="absolute inset-0" />
				</Show>
				<RunOverviewTab
					class="col-start-1 col-end-1 row-start-1 row-end-1"
					startDate={props.startDate}
					loadingDone={props.runFileLoader.done()}
					loadingProgress={props.runFileLoader.progress()}
					gameplayCard={props.gameplayCard}
				/>
				<SingleRunPageTour />
				{/* <RunClientLoader runData={runData} /> */}
			</Card>
			<AnimationOptions class="dashboard-grid-timeline" />

			<RightCard class={'dashboard-grid-splits-and-timecharts'} />
			<MobileTabBar />
		</div>
	);
};
