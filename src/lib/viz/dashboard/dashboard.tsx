import { Maximize, Minus, Rows } from 'lucide-solid';
import { JSXElement, Show, createEffect, createMemo, createSignal, type Component } from 'solid-js';
import { cardClasses, cardRoundedMdOnlyClasses } from '~/components/ui/additions';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Resizable, ResizableHandle, ResizablePanel } from '~/components/ui/resizable';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { cn } from '~/lib/utils';
import { RunFileInfo, RunFileLoader } from '../loader';
import { HKMap } from '../map';
import { RoomInfo } from '../room-infos';
import { RunSplits } from '../splits';
import { RunExtraCharts } from '../time-charts';
import { AnimationOptions } from '../timeline';
import { SingleRunPageTour } from '../tour';
import { ViewOptions } from '../view-options';
import { MobileTabBar } from './mobile-tabs';
import { RunOverviewTab } from './overview-tab';
import { LargeScreenTabs } from './tabs-large-screen';
import { useSplitsStore, useUiStore } from '../store';

export const DashboardMapOptions: Component = () => {
	const uiStore = useUiStore();
	const mobileTab = uiStore.mobileTab;
	return (
		<div class={cn('dashboard-grid-map-options', mobileTab() === 'map' ? 'flex' : 'hidden lg:flex')}>
			<ViewOptions />
			<RoomInfo />
		</div>
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
		<div class="-ml-3 hidden shrink-0 pl-1 lg:inline-block">
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

const DEFAULT_EXTRA_CHARTS_SIZE = 0.63;
const DEFAULT_SIZES = [1 - DEFAULT_EXTRA_CHARTS_SIZE, DEFAULT_EXTRA_CHARTS_SIZE];

export const RightCard: Component<{ class?: string }> = (props) => {
	const uiStore = useUiStore();
	const splitsStore = useSplitsStore();
	const mobileTab = uiStore.mobileTab;
	const [sizes, setSizes] = createSignal(DEFAULT_SIZES);

	function closeExtraCharts() {
		setSizes([1, 0]);
	}

	function closeSplits() {
		setSizes([0, 1]);
	}

	function both() {
		setSizes(DEFAULT_SIZES);
	}

	const layoutState = createMemo(() => {
		const [splitsSize, extraChartsSize] = sizes() as [number, number];
		console.log({ extraChartsSize, splitsSize });
		if (extraChartsSize < 0.1) {
			return 'only-splits';
		} else if (splitsSize < 0.1) {
			return 'only-extra-charts';
		} else {
			return 'both';
		}
	});

	createEffect(() => {
		const state = layoutState();
		splitsStore.setIsSplitsPanelOpen(state === 'only-splits' || state === 'both');
	});

	const runExtraChartsResizeOptions = (
		<ResizeButtons
			state={
				layoutState() === 'both'
					? 'medimized'
					: layoutState() === 'only-extra-charts'
						? 'maximized'
						: 'minimized'
			}
			minimize={closeExtraCharts}
			medimize={both}
			maximize={closeSplits}
		/>
	);

	const splitsResizeOptions = (
		<ResizeButtons
			state={layoutState() === 'both' ? 'medimized' : layoutState() === 'only-splits' ? 'maximized' : 'minimized'}
			minimize={closeSplits}
			medimize={both}
			maximize={closeExtraCharts}
		/>
	);

	return (
		<div
			class={cn(
				'shrink grow',
				mobileTab() === 'splits' || mobileTab() === 'time-charts' ? 'flex' : 'hidden lg:flex',
				props.class,
			)}
		>
			<Resizable orientation="vertical" sizes={sizes()} onSizesChange={setSizes}>
				<ResizablePanel
					collapsible
					minSize={0.18}
					class={cn(
						cardClasses,
						cardRoundedMdOnlyClasses,
						'overflow-hidden',
						'min-h-[44px] border-t',
						mobileTab() === 'splits' ? '' : 'hidden lg:block',
					)}
				>
					<RunSplits resizeOptions={splitsResizeOptions} />
				</ResizablePanel>
				<ResizableHandle withHandle class="hidden bg-transparent p-1 lg:flex" />
				<ResizablePanel
					collapsible
					minSize={0.3}
					class={cn(
						cardClasses,
						cardRoundedMdOnlyClasses,
						'overflow-hidden',
						'min-h-[44px] border-t',
						mobileTab() === 'time-charts' ? '' : 'hidden lg:block',
					)}
				>
					<RunExtraCharts resizeOptions={runExtraChartsResizeOptions} />
				</ResizablePanel>
			</Resizable>
		</div>
	);

	// return (
	//     <Card class="flex w-full flex-col overflow-hidden lg:w-[400px]">
	//         {isV1 && (
	//             <CardHeader class="px-4 pb-3 pt-2">
	//                 <CardTitle class="text-lg">Time-based analytics</CardTitle>
	//             </CardHeader>
	//         )}
	//         <Tabs defaultValue={isV1 ? 'extra-charts' : 'splits'} class="flex grow flex-col">
	//             {!isV1 && (
	//                 <TabsListTransparent class="flex flex-row justify-center">
	//                     <TabsTriggerTransparent value="splits">Splits</TabsTriggerTransparent>
	//                     <TabsTriggerTransparent value="extra-charts">Time charts</TabsTriggerTransparent>
	//                 </TabsListTransparent>
	//             )}
	//             <TabsContent value="splits" class="hidden shrink grow flex-col data-[state='active']:flex">
	//                 <RunSplits  />
	//             </TabsContent>
	//             <TabsContent value="extra-charts" class="hidden shrink grow flex-col data-[state='active']:flex">
	//                 <RunExtraCharts  />
	//             </TabsContent>
	//         </Tabs>
	//     </Card>
	// );
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

	const [showMap, setShowMap] = createSignal(false);

	createEffect(() => {
		setShowMap(true);
	});
	return (
		<div class="dashboard-grid">
			<DashboardMapOptions />
			<Card
				class={cn(
					cardRoundedMdOnlyClasses,
					'relative grow grid-cols-1 grid-rows-1 overflow-hidden border-t',
					mobileTab() === 'overview' ? 'dashboard-grid-map-big' : 'dashboard-grid-map',
					mobileTab() === 'overview' || mobileTab() === 'map' ? 'grid' : 'hidden lg:grid',
				)}
			>
				<LargeScreenTabs />
				<Show when={showMap()}>
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

			<RightCard class="dashboard-grid-splits-and-timecharts" />
			<MobileTabBar />
		</div>
	);
};
