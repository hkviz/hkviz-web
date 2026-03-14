import { JSXElement, Show, createEffect, createSignal, type Component } from 'solid-js';
import { cardRoundedMdOnlyClasses } from '~/components/ui/additions';
import { Card } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { LayoutLane } from '../layout/layout-lane';
import { RunFileInfo, RunFileLoader } from '../loader';
import { HKMap } from '../map';
import { useUiStore, useViewportStore } from '../store';
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
