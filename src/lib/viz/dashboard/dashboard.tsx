import { JSXElement, Show, createEffect, createSignal, type Component } from 'solid-js';
import { cardRoundedMdOnlyClasses } from '~/components/ui/additions';
import { Card } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { RunMetadata } from '~/server/run/_find_runs_internal';
import { LayoutLane } from '../layout/layout-lane';
import { RunFileInfo, RunFileLoader } from '../loader';
import { MapView } from '../map';
import { useUiStore } from '../store/ui-store';
import { useViewportStore } from '../store/viewport-store';
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

export const RightCard: Component<{ class?: string }> = (props) => {
	const uiStore = useUiStore();
	const mobileTab = uiStore.mobileTab;
	return <LayoutLane class={cn(mobileTab() === 'right' ? 'flex' : 'hidden lg:flex', props.class)} lane="right" />;
};

export interface GameplayDashboardProps {
	fileInfos: RunFileInfo[];
	runData: RunMetadata;
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
		<div class={cn('dashboard-grid', mobileTab() === 'right' ? 'dashboard-mobile-tab-right' : '')}>
			<Show when={showMap() && isSmallMobileLayout()}>
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
					mobileTab() === 'overview' ? 'grid' : 'hidden md:grid',
				)}
			>
				<LargeScreenTabs />
				<RunOverviewTab
					class="z-10 col-start-1 col-end-1 row-start-1 row-end-1"
					startDate={props.runData.startedAt}
					loadingDone={props.runFileLoader.done()}
					loadingProgress={props.runFileLoader.progress()}
					gameplayCard={props.gameplayCard}
				/>
				<Show when={showMap() && !isSmallMobileLayout()}>
					<MapView class="absolute inset-0" />
				</Show>
				<SingleRunPageTour />
				{/* <RunClientLoader runData={runData} /> */}
			</Card>
			<AnimationOptions class="dashboard-grid-timeline" />

			<RightCard class={'dashboard-grid-splits-and-timecharts'} />
			<MobileTabBar />
		</div>
	);
};
